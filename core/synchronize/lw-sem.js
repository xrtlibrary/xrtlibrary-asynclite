//
//  Copyright 2021 - 2022 The XRT Authors. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Constants.
//

//  Dummy callback.
const DUMMY_CALLBACK = function() {};

//
//  Classes.
//

/**
 *  Wait handle of lightweight semaphores.
 * 
 *  @constructor
 */
const LwSemaphoreWaitHandle = (function() {
    //
    //  Class definition.
    //
    return class WaitHandle_ {
        //
        //  Public members.
        //

        /**
         *  Wait status.
         * 
         *  Note(s):
         *    [1] The value of this member can be one of STATUS_{AWAIT, 
         *        ACQUIRED, CANCELLED}.
         * 
         *  @type {Number}
         */
        status;

        /**
         *  Promise-based wait handle.
         * 
         *  Note(s):
         *    [1] The promise-based wait handle resolves with `this` when leaves
         *        STATUS_AWAIT status.
         * 
         *  @type {Promise<InstanceType<typeof LwSemaphore.WaitHandle>>}
         */
        handle;

        /**
         *  Cancellator function.
         * 
         *  @type {() => void}
         */
        cancel;

        //
        //  Constructors.
        //

        /**
         *  New object.
         * 
         *  @ignore
         */
        constructor() {
            this.status = null;
            this.handle = null;
            this.cancel = null;
        }

        //
        //  Public static constants.
        //

        /**
         *  Wait status: Awaiting.
         * 
         *  Note(s):
         *    [1] This status means that the waiter is still acquiring the 
         *        semaphore.
         * 
         *  @type {Number}
         */
        static STATUS_AWAIT = 0;

        /**
         *  Wait status: Acquired.
         * 
         *  Note(s):
         *    [1] This status means that the waiter acquired the semaphore.
         * 
         *  @type {Number}
         */
        static STATUS_ACQUIRED = 1;

        /**
         *  Wait status: Cancelled.
         * 
         *  Note(s):
         *    [1] This status means that the cancellator function was called 
         *        before the waiter acquires the semaphore.
         * 
         *  @type {Number}
         */
        static STATUS_CANCELLED = 2;
    };
})();

/**
 *  Lightweight semaphore.
 * 
 *  @constructor
 */
const LwSemaphore = (function() {
    //
    //  Local type definitions.
    //

    /**
     *  @typedef {Object} TClassPrivateFields
     *  @property {Number} tokens
     *    - Available tokens.
     *  @property {Set<() => void>} waiters
     *    - Waiter callbacks.
     */

    //
    //  Local constants.
    //

    /**
     *  Instance private fields.
     * 
     *  @type {WeakMap<InstanceType<typeof LwSemaphore>, TClassPrivateFields>}
     */
    const INSTANCE_PRIVFIELDS = new WeakMap();

    //
    //  Class definition.
    //
    return class LwSemaphore_ {
        //
        //  Constructor.
        //

        /**
         *  New object.
         * 
         *  Note(s):
         *    [1] The value of `initial` parameter must be non-negative integer.
         * 
         *  @throws {Error}
         *    - Possible reason(s):
         *      - Invalid initial semaphore value.
         *  @param {Number} [initial]
         *    - The initial semaphore value.
         */
        constructor(initial = 0) {
            //  Check the initial semaphore value.
            if (!(
                Number.isInteger(initial) && 
                initial >= 0
            )) {
                throw new Error("Invalid initial semaphore value.");
            }

            //  Initialize private fields.
            INSTANCE_PRIVFIELDS.set(this, {
                "tokens": initial,
                "waiters": new Set()
            });
        }

        //
        //  Public methods.
        //

        /**
         *  Acquire the semaphore.
         * 
         *  @param {Number} [flags]
         *    - The acquire flag (combination of ACFLAG_{NOWAIT}, 0 if no flag).
         *  @returns {?(InstanceType<typeof LwSemaphore.WaitHandle>)}
         *    - The wait handle (NULL if ACFLAG_NOWAIT flag is used and the 
         *      semaphore can't be acquired immediately).
         */
        acquire(flags = 0) {
            //  Get private fields.
            let privfields = INSTANCE_PRIVFIELDS.get(this);

            //  Fast path: acquire immediately if there is at least one 
            //  remaining token.
            if (privfields.tokens > 0) {
                //  Decrease the token count.
                --(privfields.tokens);

                //  Create a wait handle.
                let wh = new LwSemaphore.WaitHandle();
                wh.status = LwSemaphore.WaitHandle.STATUS_ACQUIRED;
                wh.handle = Promise.resolve(wh);
                wh.cancel = DUMMY_CALLBACK;

                return wh;
            }

            //
            //  Slow path: Wait for available token.
            //

            //  Return if NOWAIT flag is set.
            if ((flags & LwSemaphore.ACFLAG_NOWAIT) != 0) {
                return null;
            }

            //  Get the waiter callback set.
            let waiters = privfields.waiters;

            //  Create a wait handle.
            let wh = new LwSemaphore.WaitHandle();
            let status = LwSemaphore.WaitHandle.STATUS_AWAIT;
            wh.status = status;
            wh.handle = new Promise(function(resolve) {
                /**
                 *  Notify the wait handle.
                 */
                function _WaitHandle_Notify() {
                    //  Go to ACQUIRED status.
                    status = LwSemaphore.WaitHandle.STATUS_ACQUIRED;
                    wh.status = status;

                    //  Detach the notifier.
                    waiters.delete(_WaitHandle_Notify);

                    //  Let the wait handle resolve.
                    resolve(wh);
                }

                //  Assign cancellator function.
                wh.cancel = function() {
                    //  Do not operate if not in AWAIT status.
                    if (status != LwSemaphore.WaitHandle.STATUS_AWAIT) {
                        return;
                    }

                    //  Go to CANCELLED status.
                    status = LwSemaphore.WaitHandle.STATUS_CANCELLED;
                    wh.status = status;

                    //  Detach the notifier.
                    waiters.delete(_WaitHandle_Notify);

                    //  Let the wait handle resolve.
                    resolve(wh);
                };

                //  Attach the notifier.
                waiters.add(_WaitHandle_Notify);
            });

            return wh;
        }

        /**
         *  Release the semaphore.
         */
        release() {
            //  Get private fields.
            let privfields = INSTANCE_PRIVFIELDS.get(this);

            //  Get the waiter callback set.
            let waiters = privfields.waiters;

            if (waiters.size == 0) {
                //  No waiter, increase the token count.
                ++(privfields.tokens);
            } else {
                //  Pick one waiter (and invoke).
                /**
                 *  @type {() => void}
                 */
                let waiter = null;
                for (let iw of waiters) {
                    waiter = iw;
                    break;
                }
                waiter();
            }
        }

        //
        //  Public static members.
        //

        /**
         *  Wait handle.
         * 
         *  @constructor
         */
        static WaitHandle = LwSemaphoreWaitHandle;

        //
        //  Public static constants.
        //

        /**
         *  Acquire flag: No wait.
         * 
         *  @type {Number}
         */
        static ACFLAG_NOWAIT = ((1 << 0) >>> 0);
    };
})();

//  Export public APIs.
module.exports = {
    "LwSemaphore": LwSemaphore
};