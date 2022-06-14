//
//  Copyright 2021 - 2022 The XRT Authors. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Imports.
//

//  Imported modules.
const Process = 
    require("process");

//
//  Constants.
//

//  Dummy callback.
const DUMMY_CALLBACK = function() {};

//
//  Classes.
//

/**
 *  Wait handle of lightweight event flags.
 * 
 *  @constructor
 */
const LwEventFlagsWaitHandle = (function() {
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
         *        SATISFIED, CANCELLED}.
         * 
         *  @type {Number}
         */
        status;

        /**
         *  Flag value at the time that this wait handle satisfies.
         * 
         *  @type {Number}
         */
        value;

        /**
         *  Promise-based wait handle.
         * 
         *  Note(s):
         *    [1] The promise-based wait handle resolves with `this` when leaves
         *        STATUS_AWAIT status.
         * 
         *  @type {Promise<InstanceType<typeof LwEventFlags.WaitHandle>>}
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
            this.value  = null;
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
         *    [1] This status means that the condition of the wait handle hasn't
         *        been satisfied yet.
         * 
         *  @type {Number}
         */
        static STATUS_AWAIT = 0;

        /**
         *  Wait status: Satisfied.
         * 
         *  Note(s):
         *    [1] This status means that the condition of the wait handle has 
         *        already been satisfied.
         * 
         *  @type {Number}
         */
        static STATUS_SATISFIED = 1;

        /**
         *  Wait status: Cancelled.
         * 
         *  Note(s):
         *    [1] This status means that the cancellator function was called 
         *        before the condition of the wait handle satisfies.
         * 
         *  @type {Number}
         */
        static STATUS_CANCELLED = 2;
    };
})();

/**
 *  Lightweight event flags.
 * 
 *  @constructor
 */
const LwEventFlags = (function() {
    //
    //  Local type definitions.
    //

    /**
     *  @typedef {Object} TClassPrivateFields
     *  @property {Number} current
     *    - Current flag value.
     *  @property {Set<() => Number>} notifiers
     *    - Value change notifiers.
     *      - The return value of the notifier function is a combination of 
     *        RCHKRETFL_{DETACH, VALUECHANGE}.
     *  @property {Boolean} notifying
     *    - Notifying flag.
     */

    //
    //  Local constants.
    //

    /**
     *  Instance private fields.
     * 
     *  @type {WeakMap<InstanceType<typeof LwEventFlags>, TClassPrivateFields>}
     */
    const INSTANCE_PRIVFIELDS = new WeakMap();

    /**
     *  Recheck return flag: Detach the recheck function.
     * 
     *  @type {Number}
     */
    const RCHKRETFL_DETACH = ((1 << 0) >>> 0);

    /**
     *  Recheck return flag: Flag value changed.
     * 
     *  @type {Number}
     */
    const RCHKRETFL_VALUECHANGE = ((1 << 1) >>> 0);

    //
    //  Local functions.
    //

    /**
     *  Pending condition checker: for PENDOP_CLR_ALL operation.
     * 
     *  Note(s):
     *    [1] The value of `value` parameter is assumed to be an integer between
     *        0x00000000 and 0xFFFFFFFF.
     *    [1] The value of `bits` parameter is assumed to be an integer between
     *        0x00000000 and 0xFFFFFFFF.
     * 
     *  @param {Number} value
     *    - The flag value to be checked.
     *  @param {Number} bits
     *    - The selected bits.
     *  @returns {Boolean}
     *    - True if the condition satisfies.
     */
    function _PendConditionChk_ClearAll(value, bits) {
        return ((value & bits) == 0);
    }

    /**
     *  Pending condition checker: for PENDOP_CLR_ANY operation.
     * 
     *  Note(s):
     *    [1] The value of `value` parameter is assumed to be an integer between
     *        0x00000000 and 0xFFFFFFFF.
     *    [1] The value of `bits` parameter is assumed to be an integer between
     *        0x00000000 and 0xFFFFFFFF.
     * 
     *  @param {Number} value
     *    - The flag value to be checked.
     *  @param {Number} bits
     *    - The selected bits.
     *  @returns {Boolean}
     *    - True if the condition satisfies.
     */
    function _PendConditionChk_ClearAny(value, bits) {
        return (((value & bits) >>> 0) != bits);
    }

    /**
     *  Pending condition checker: for PENDOP_SET_ALL operation.
     * 
     *  Note(s):
     *    [1] The value of `value` parameter is assumed to be an integer between
     *        0x00000000 and 0xFFFFFFFF.
     *    [1] The value of `bits` parameter is assumed to be an integer between
     *        0x00000000 and 0xFFFFFFFF.
     * 
     *  @param {Number} value
     *    - The flag value to be checked.
     *  @param {Number} bits
     *    - The selected bits.
     *  @returns {Boolean}
     *    - True if the condition satisfies.
     */
    function _PendConditionChk_SetAll(value, bits) {
        return (((value & bits) >>> 0) == bits);
    }

    /**
     *  Pending condition checker: for PENDOP_SET_ANY operation.
     * 
     *  Note(s):
     *    [1] The value of `value` parameter is assumed to be an integer between
     *        0x00000000 and 0xFFFFFFFF.
     *    [1] The value of `bits` parameter is assumed to be an integer between
     *        0x00000000 and 0xFFFFFFFF.
     * 
     *  @param {Number} value
     *    - The flag value to be checked.
     *  @param {Number} bits
     *    - The selected bits.
     *  @returns {Boolean}
     *    - True if the condition satisfies.
     */
    function _PendConditionChk_SetAny(value, bits) {
        return ((value & bits) != 0);
    }

    /**
     *  Pending consumer: for PENDOP_CLR_{ALL, ANY} operations.
     * 
     *  Note(s):
     *    [1] The value of `value` parameter is assumed to be an integer between
     *        0x00000000 and 0xFFFFFFFF.
     *    [1] The value of `bits` parameter is assumed to be an integer between
     *        0x00000000 and 0xFFFFFFFF.
     * 
     *  @param {Number} value
     *    - The origin flag value.
     *  @param {Number} bits
     *    - The bits to be consumed.
     *  @returns {Number}
     *    - The proceed flag value.
     */
    function _PendConsume_Clear(value, bits) {
        //  Affected bits should be set.
        value |= bits;
        return (value >>> 0);
    }

    /**
     *  Pending consumer: for PENDOP_SET_{ALL, ANY} operations.
     * 
     *  Note(s):
     *    [1] The value of `value` parameter is assumed to be an integer between
     *        0x00000000 and 0xFFFFFFFF.
     *    [1] The value of `bits` parameter is assumed to be an integer between
     *        0x00000000 and 0xFFFFFFFF.
     * 
     *  @param {Number} value
     *    - The origin flag value.
     *  @param {Number} bits
     *    - The bits to be consumed.
     *  @returns {Number}
     *    - The proceed flag value.
     */
    function _PendConsume_Set(value, bits) {
        //  Affected bits should be cleared.
        bits ^= 0xFFFFFFFF;
        bits  = (bits >>> 0);
        value &= bits;
        return (value >>> 0);
    }

    //
    //  Class private methods.
    //

    /**
     *  Notify value change.
     * 
     *  @param {TClassPrivateFields} privfields
     *    - The instance private fields.
     */
    function _ClassPriv_Notify(privfields) {
        //  Unset the notifying flag.
        privfields.notifying = false;

        //  Get notifiers.
        let notifiers = privfields.notifiers;

        //  Notify all.
        /**
         *  Detached notifier set.
         * 
         *  @type {Set<() => Number>}
         */
        let detached = new Set();
        let rescan = false;
        do {
            rescan = false;
            for (let ntfy of notifiers) {
                if (detached.has(ntfy)) {
                    continue;
                }
                let rchkflg = ntfy();
                if ((rchkflg & RCHKRETFL_DETACH) != 0) {
                    detached.add(ntfy);
                }
                if ((rchkflg & RCHKRETFL_VALUECHANGE) != 0) {
                    rescan = true;
                    break;
                }
            }
        } while(rescan);
        if (detached.size != 0) {
            for (let ntfy of detached) {
                notifiers.delete(ntfy);
            }
        }
    }

    //
    //  Class definition.
    //
    return class LwEventFlags_ {
        //
        //  Constructor.
        //

        /**
         *  New object.
         * 
         *  Note(s):
         *    [1] The value of `initial` parameter must be an integer between 
         *        0x00000000 and 0xFFFFFFFF.
         * 
         *  @throws {Error}
         *    - Possible reason(s):
         *      - Invalid initial flag value.
         *  @param {Number} [initial]
         *    - The initial flag value.
         */
        constructor(initial = 0) {
            //  Check the initial flag value.
            if (!(
                Number.isInteger(initial) && 
                initial >= 0x00000000 && 
                initial <= 0xFFFFFFFF
            )) {
                throw new Error("Invalid initial flag value.");
            }

            //  Initialize private fields.
            INSTANCE_PRIVFIELDS.set(this, {
                "current": initial,
                "notifiers": new Set()
            });
        }

        //
        //  Public members.
        //

        /**
         *  Get current flag value.
         * 
         *  @returns {Number}
         *    - The flag value.
         */
        get value() {
            //  Get private fields.
            let privfields = INSTANCE_PRIVFIELDS.get(this);

            //  Get current value.
            return privfields.current;
        }

        /**
         *  Set current flag value.
         * 
         *  Note(s):
         *    [1] The new flag value must be an integer between 0x00000000 and 
         *        0xFFFFFFFF.
         * 
         *  @throws {Error}
         *    - Possible reason(s):
         *      - Invalid flag value.
         *  @param {Number} newval
         *    - The new flag value.
         */
        set value(newval) {
            //  Check the new value.
            if (!(
                Number.isInteger(newval) && 
                newval >= 0x00000000 && 
                newval <= 0xFFFFFFFF
            )) {
                throw new Error("Invalid flag value.");
            }

            //  Get private fields.
            let privfields = INSTANCE_PRIVFIELDS.get(this);

            //  Get current value.
            let oldval = privfields.current;

            //  Apply the new value.
            if (newval != oldval) {
                privfields.current = newval;
                if (!privfields.notifying) {
                    privfields.notifying = true;
                    Process.nextTick(_ClassPriv_Notify, privfields);
                }
            }
        }

        //
        //  Public methods.
        //

        /**
         *  Pend on selected bits.
         * 
         *  Note(s):
         *    [1] The value of `bits` parameter must be an integer between 
         *        0x00000000 and 0xFFFFFFFF. Set correlated bit of `bits` to 1
         *        if that bit is selected.
         * 
         *  @throws {Error}
         *    - Possible reason(s):
         *      - Invalid bits selection.
         *      - Invalid pending operation.
         *  @param {Number} bits
         *    - The selected bits.
         *  @param {Number} op
         *    - The pending operation (one of PENDOP_{CLR_ALL, CLR_ANY, SET_ALL,
         *      SET_ANY}).
         *  @param {Number} [flags]
         *    - The pending flag (combination of PENDFLAG_{CONSUME, NOWAIT}, 0 
         *      if no flag).
         *  @returns {?(InstanceType<typeof LwEventFlags.WaitHandle>)}
         *    - The wait handle (NULL if PENDFLAG_NOWAIT flag is used and the 
         *      pending condition can't be satisified immediately).
         */
        pend(bits, op, flags = 0) {
            //  Check the bits selection.
            if (!(
                Number.isInteger(bits) && 
                bits >= 0x00000000 && 
                bits <= 0xFFFFFFFF
            )) {
                throw new Error("Invalid bits selection.");
            }

            //  Check the pending operation.
            /**
             *  @type {(value: Number, bits: Number, original: Number) => Boolean}
             */
            let chker = null;
            /**
             *  @type {(value: Number, bits: Number, original: Number) => Boolean}
             */
            let consumer = null;
            switch(op) {
            case LwEventFlags_.PENDOP_CLR_ALL:
                chker = _PendConditionChk_ClearAll;
                consumer = _PendConsume_Clear;
                break;
            case LwEventFlags_.PENDOP_CLR_ANY:
                chker = _PendConditionChk_ClearAny;
                consumer = _PendConsume_Clear;
                break;
            case LwEventFlags_.PENDOP_SET_ALL:
                chker = _PendConditionChk_SetAll;
                consumer = _PendConsume_Set;
                break;
            case LwEventFlags_.PENDOP_SET_ANY:
                chker = _PendConditionChk_SetAny;
                consumer = _PendConsume_Set;
                break;
            default:
                throw new Error("Invalid pending operation.");
            }

            //  Get private fields.
            let privfields = INSTANCE_PRIVFIELDS.get(this);

            //  Get current value.
            let current = privfields.current;

            //  Save the original value before the pending operation.
            let original = current;

            //  Get value change notifier set.
            let notifiers = privfields.notifiers;

            //  Fast path: Already satisfied.
            if (chker(current, bits, original)) {
                //  Create the wait handle.
                let wh = new LwEventFlags_.WaitHandle();
                wh.status = LwEventFlags_.WaitHandle.STATUS_SATISFIED;
                wh.value = current;
                wh.handle = Promise.resolve(wh);
                wh.cancel = DUMMY_CALLBACK;

                //  Consume bits.
                if ((flags & LwEventFlags_.PENDFLAG_CONSUME) != 0) {
                    let newval = consumer(
                        current, 
                        bits, 
                        original
                    );
                    if (current != newval) {
                        privfields.current = newval;
                        if (!privfields.notifying) {
                            privfields.notifying = true;
                            Process.nextTick(_ClassPriv_Notify, privfields);
                        }
                    }
                }

                return wh;
            }

            //  NULL if NOWAIT flag is used.
            if ((flags & LwEventFlags_.PENDFLAG_NOWAIT) != 0) {
                return null;
            }

            //  Slow path: Wait for condition satisfication.
            let wh = new LwEventFlags_.WaitHandle();
            let status = LwEventFlags_.WaitHandle.STATUS_AWAIT;
            wh.status = status;
            wh.value = 0;
            wh.handle = new Promise(function(resolve) {
                /**
                 *  Recheck function.
                 * 
                 *  @returns {Number}
                 *    - The recheck return flags.
                 */
                function _WaitHandle_Recheck() {
                    //  Do not operate if not in AWAIT status.
                    if (status != LwEventFlags_.WaitHandle.STATUS_AWAIT) {
                        return RCHKRETFL_DETACH;
                    }

                    //  Update current value.
                    current = privfields.current;

                    //  Check current value.
                    if (chker(current, bits, original)) {
                        let rchkfl = RCHKRETFL_DETACH;

                        //  Go to SATISFIED status.
                        status = LwEventFlags_.WaitHandle.STATUS_SATISFIED;
                        wh.status = status;

                        //  Save the value.
                        wh.value = current;

                        //  Consume bits.
                        if ((flags & LwEventFlags_.PENDFLAG_CONSUME) != 0) {
                            privfields.current = consumer(
                                current, 
                                bits, 
                                original
                            );
                            rchkfl += RCHKRETFL_VALUECHANGE;
                        }

                        //  Let the wait handle resolve.
                        resolve(wh);

                        return rchkfl;
                    }

                    return 0;
                }

                //  Assign cancellator function.
                wh.cancel = function() {
                    //  Do not operate if not in AWAIT status.
                    if (status != LwEventFlags_.WaitHandle.STATUS_AWAIT) {
                        return;
                    }

                    //  Go to CANCELLED status.
                    status = LwEventFlags_.WaitHandle.STATUS_CANCELLED;
                    wh.status = status;

                    //  Detach the recheck notifier.
                    notifiers.delete(_WaitHandle_Recheck);

                    //  Let the wait handle resolve.
                    resolve(wh);
                };

                //  Attach value change notifier.
                notifiers.add(_WaitHandle_Recheck);
            });

            return wh;
        }

        /**
         *  Post on selected bits.
         * 
         *  Note(s):
         *    [1] The value of `bits` parameter must be an integer between 
         *        0x00000000 and 0xFFFFFFFF. Set correlated bit of `bits` to 1
         *        if that bit is selected.
         * 
         *  @throws {Error}
         *    - Possible reason(s):
         *      - Invalid bits selection.
         *      - Invalid post operation.
         *  @param {Number} bits
         *    - The selected bits.
         *  @param {Number} op
         *    - The post operation (one of POSTOP_{CLR, SET, FLIP}).
         *  @returns {InstanceType<typeof LwEventFlags>}
         *    - `this` for method chaining.
         */
        post(bits, op) {
            //  Check the bits selection.
            if (!(
                Number.isInteger(bits) && 
                bits >= 0x00000000 && 
                bits <= 0xFFFFFFFF
            )) {
                throw new Error("Invalid bits selection.");
            }

            //  Get private fields.
            let privfields = INSTANCE_PRIVFIELDS.get(this);

            //  Get current value.
            let oldval = privfields.current;

            //  Do the post operation.
            let newval = null;
            switch(op) {
            case LwEventFlags_.POSTOP_CLR:
                bits  ^= 0xFFFFFFFF;
                bits   = (bits >>> 0);
                newval = ((oldval & bits) >>> 0);
                break;
            case LwEventFlags_.POSTOP_SET:
                newval = ((oldval | bits) >>> 0);
                break;
            case LwEventFlags_.POSTOP_FLIP:
                newval = ((oldval ^ bits) >>> 0);
                break;
            default:
                throw new Error("Invalid post operation.");
            }

            //  Apply the new value.
            if (newval != oldval) {
                privfields.current = newval;
                if (!privfields.notifying) {
                    privfields.notifying = true;
                    Process.nextTick(_ClassPriv_Notify, privfields);
                }
            }

            return this;
        }

        /**
         *  Monitor any change on the flag value.
         * 
         *  @returns {?(InstanceType<typeof LwEventFlags.WaitHandle>)}
         *    - The wait handle.
         */
        monitor() {
            //  Get private fields.
            let privfields = INSTANCE_PRIVFIELDS.get(this);

            //  Get current value as previous value.
            let previous = privfields.current;

            //  Get value change notifier set.
            let notifiers = privfields.notifiers;

            //  Monitor value change.
            let wh = new LwEventFlags_.WaitHandle();
            let status = LwEventFlags_.WaitHandle.STATUS_AWAIT;
            wh.status = status;
            wh.value = 0;
            wh.handle = new Promise(function(resolve) {
                /**
                 *  Recheck function.
                 * 
                 *  @returns {Number}
                 *    - The recheck return flags.
                 */
                function _WaitHandle_Recheck() {
                    //  Do not operate if not in AWAIT status.
                    if (status != LwEventFlags_.WaitHandle.STATUS_AWAIT) {
                        return RCHKRETFL_DETACH;
                    }

                    //  Get and check current value.
                    let current = privfields.current;
                    if (current != previous) {
                        //  Go to SATISFIED status.
                        status = LwEventFlags_.WaitHandle.STATUS_SATISFIED;
                        wh.status = status;

                        //  Save the value.
                        wh.value = current;

                        //  Let the wait handle resolve.
                        resolve(wh);

                        return RCHKRETFL_DETACH;
                    }

                    return 0;
                }

                //  Assign cancellator function.
                wh.cancel = function() {
                    //  Do not operate if not in AWAIT status.
                    if (status != LwEventFlags_.WaitHandle.STATUS_AWAIT) {
                        return;
                    }

                    //  Go to CANCELLED status.
                    status = LwEventFlags_.WaitHandle.STATUS_CANCELLED;
                    wh.status = status;

                    //  Detach the recheck notifier.
                    notifiers.delete(_WaitHandle_Recheck);

                    //  Let the wait handle resolve.
                    resolve(wh);
                };

                //  Attach value change notifier.
                notifiers.add(_WaitHandle_Recheck);
            });

            return wh;
        }

        //
        //  Public static members.
        //

        /**
         *  Wait handle.
         * 
         *  @constructor
         */
        static WaitHandle = LwEventFlagsWaitHandle;

        //
        //  Public static constants.
        //

        /**
         *  Pending operation: All bits cleared.
         * 
         *  Note(s):
         *    [1] This operation means that the pending condition would become 
         *        satisfied once all selected bits of the flag value are 
         *        cleared (=> 0).
         * 
         *  @type {Number}
         */
        static PENDOP_CLR_ALL  = 10001;

        /**
         *  Pending operation: Any bit cleared.
         * 
         *  Note(s):
         *    [1] This operation means that the pending condition would become 
         *        satisfied once any of selected bits of the flag value is 
         *        cleared (=> 0).
         * 
         *  @type {Number}
         */
        static PENDOP_CLR_ANY  = 10002;

        /**
         *  Pending operation: All bits set.
         * 
         *  Note(s):
         *    [1] This operation means that the pending condition would become 
         *        satisfied once all selected bits of the flag value are set 
         *        (=> 1).
         * 
         *  @type {Number}
         */
        static PENDOP_SET_ALL  = 10003;

        /**
         *  Pending operation: Any bit set.
         * 
         *  Note(s):
         *    [1] This operation means that the pending condition would become 
         *        satisfied once any of selected bits of the flag value is 
         *        set (=> 1).
         * 
         *  @type {Number}
         */
        static PENDOP_SET_ANY  = 10004;

        /**
         *  Pending flag: Consume bit changes.
         * 
         *  @type {Number}
         */
        static PENDFLAG_CONSUME = ((1 << 0) >>> 0);

        /**
         *  Pending flag: No wait.
         * 
         *  @type {Number}
         */
        static PENDFLAG_NOWAIT  = ((1 << 1) >>> 0);

        /**
         *  Post operation: Clear selected bits.
         * 
         *  Note(s):
         *    [1] This operation means that selected bits of the flag value 
         *        would be cleared (=> 0).
         * 
         *  @type {Number}
         */
        static POSTOP_CLR = 10101;

        /**
         *  Post operation: Set selected bits.
         * 
         *  Note(s):
         *    [1] This operation means that selected bits of the flag value 
         *        would be set (=> 1).
         * 
         *  @type {Number}
         */
        static POSTOP_SET = 10102;

        /**
         *  Post operation: Flip selected bits.
         * 
         *  Note(s):
         *    [1] This operation means that selected bits of the flag value 
         *        would be flipped (0 => 1, 1 => 0).
         * 
         *  @type {Number}
         */
        static POSTOP_FLIP = 10103;
    };
})();

//  Export public APIs.
module.exports = {
    "LwEventFlags": LwEventFlags
};
