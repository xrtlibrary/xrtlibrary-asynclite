//
//  Copyright 2021 - 2022 The XRT Authors. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Imports.
//

//  Imported modules.
const Timers = 
    require("timers");

//
//  Constants.
//

//  Dummy callback.
const DUMMY_CALLBACK = function() {};

//
//  Classes.
//

/**
 *  Lightweight timeout.
 * 
 *  @constructor
 */
const LwTimeout = (function() {
    //
    //  Local constants.
    //

    /**
     *  LwTimeout.WaitUntil() poll interval.
     * 
     *  @type {Number}
     */
    const WAITUNTIL_POLL_ITV = 1000;

    //
    //  Class definition.
    //
    return class LwTimeout_ {
        //
        //  Public members.
        //

        /**
         *  Wait status.
         * 
         *  Note(s):
         *    [1] The value of this member can be one of STATUS_{AWAIT, 
         *        EXPIRED, CANCELLED}.
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
         *  @type {Promise<InstanceType<typeof LwTimeout>>}
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
         *    [1] This status means that the timeout timer is not expired.
         * 
         *  @type {Number}
         */
        static STATUS_AWAIT = 0;

        /**
         *  Wait status: Expired.
         * 
         *  Note(s):
         *    [1] This status means that the timeout timer was already expired.
         * 
         *  @type {Number}
         */
        static STATUS_EXPIRED = 1;

        /**
         *  Wait status: Cancelled.
         * 
         *  Note(s):
         *    [1] This status means that the cancellator function was called 
         *        before the timeout timer expires.
         * 
         *  @type {Number}
         */
        static STATUS_CANCELLED = 2;

        //
        //  Public static methods.
        //

        /**
         *  Delay for specific timespan.
         * 
         *  Note(s):
         *    [1] The value of `ms` must be a non-negative integer (Infinity and
         *        NaN are not acceptable).
         * 
         *  @throws {Error}
         *    - Possible reason(s):
         *      - Invalid delay timespan.
         *  @param {Number} ms
         *    - The delay timespan (unit: milliseconds).
         *  @returns {InstanceType<typeof LwTimeout>}
         *    - The wait handle.
         */
        static Delay(ms) {
            //  Check the delay timespan.
            if (
                typeof(ms) != "number" || 
                Number.isNaN(ms) || 
                (!Number.isFinite(ms)) || 
                ms < 0
            ) {
                throw new Error("Invalid delay timespan.");
            }

            //  Create wait handle.
            let wh = new LwTimeout();
            let status = LwTimeout.STATUS_AWAIT;
            wh.status = status;
            wh.handle = new Promise(function(resolve) {
                //  Initiate the timeout timer.
                let tmr = Timers.setTimeout(function() {
                    //  Return if not in AWAIT status.
                    if (status != LwTimeout.STATUS_AWAIT) {
                        return;
                    }

                    //  Switch to EXPIRED status.
                    status = LwTimeout.STATUS_EXPIRED;
                    wh.status = status;

                    //  Let the wait handle resolve.
                    resolve(wh);
                }, ms);

                //  Create the cancellator function.
                wh.cancel = function() {
                    //  Return if not in AWAIT status.
                    if (status != LwTimeout.STATUS_AWAIT) {
                        return;
                    }

                    //  Switch to CANCELLED status.
                    status = LwTimeout.STATUS_CANCELLED;
                    wh.status = status;

                    //  Dispose the timeout timer.
                    Timers.clearTimeout(tmr);

                    //  Let the wait handle resolve.
                    resolve(wh);
                };
            });

            return wh;
        }

        /**
         *  Wait until specified time.
         * 
         *  Note(s):
         *    [1] The value of `ts` is the number of milliseconds elapsed since 
         *        January 1, 1970 UTC, with leap seconds ignored.
         *    [2] The value of `ts` can only be non-negative integer (Infinity 
         *        and NaN are not acceptable).
         * 
         *  @throws {Error}
         *    - Possible reason(s):
         *      - Invalid timestamp.
         *  @param {Number} ts
         *    - The timestamp.
         *  @returns {InstanceType<typeof LwTimeout>}
         *    - The wait handle.
         */
        static WaitUntil(ts) {
            //  Check the timestamp.
            if (
                typeof(ts) != "number" || 
                Number.isNaN(ts) || 
                (!Number.isFinite(ts)) || 
                ts < 0
            ) {
                throw new Error("Invalid timestamp.");
            }

            //  Get current timestamp.
            let tsnow = Date.now();

            //  Fast path: No need to wait.
            if (tsnow >= ts) {
                //  Create the wait handle.
                let wh = new LwTimeout();
                wh.status = LwTimeout.STATUS_EXPIRED;
                wh.handle = Promise.resolve(wh);
                wh.cancel = DUMMY_CALLBACK;

                return wh;
            }

            //
            //  Slow path: Poll until timeout.
            //

            //  Create the wait handle.
            let wh = new LwTimeout();
            let status = LwTimeout.STATUS_AWAIT;
            // let cancelled = false;
            let fnCancelPropagate = DUMMY_CALLBACK;
            wh.status = status;
            wh.handle = (async function() {
                while (tsnow < ts) {
                    //  Get the delay timespan.
                    let dly = ts - tsnow;
                    if (dly > WAITUNTIL_POLL_ITV) {
                        dly = WAITUNTIL_POLL_ITV;
                    }

                    //  Delay for a moment.
                    let tmowh = LwTimeout.Delay(dly);
                    fnCancelPropagate = tmowh.cancel;
                    await tmowh.handle;
                    if (tmowh.status == LwTimeout.STATUS_CANCELLED) {
                        //  Switch to CANCELLED state.
                        status = LwTimeout.STATUS_CANCELLED;
                        wh.status = status;

                        return wh;
                    }
                    fnCancelPropagate = DUMMY_CALLBACK;

                    //  Update current timestamp.
                    tsnow = Date.now();
                }

                //  Switch to EXPIRED state.
                status = LwTimeout.STATUS_EXPIRED;
                wh.status = status;

                return wh;
            })();
            wh.cancel = function() {
                // cancelled = true;
                fnCancelPropagate();
            };

            return wh;
        }
    };
})();

//  Export public APIs.
module.exports = {
    "LwTimeout": LwTimeout
};
