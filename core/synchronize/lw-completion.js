//
//  Copyright 2021 The XRT Authors. All rights reserved.
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
 *  Wait handle of lightweight completions.
 * 
 *  @template T
 *  @constructor
 */
const LwCompletionWaitHandle = (function() {
    //
    //  Class definition.
    //
    return class LwCompletionWaitHandle_ {
        //
        //  Public members.
        //

        /**
         *  Wait status.
         * 
         *  Note(s):
         *    [1] The value of this member can be one of STATUS_{AWAIT, 
         *        COMPLETED, CANCELLED}.
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
         *  @type {Promise<InstanceType<typeof LwCompletion.WaitHandle<T>>>}
         */
        handle;

        /**
         *  Completion value.
         * 
         *  @type {T}
         */
        value;

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
            this.value = null;
            this.cancel = null;
        }

        //
        //  Public static constants.
        //

        /**
         *  Wait status: Awaiting.
         * 
         *  Note(s):
         *    [1] This status means that the completion of the wait handle 
         *        hasn't been completed yet.
         * 
         *  @type {Number}
         */
        static STATUS_AWAIT = 0;

        /**
         *  Wait status: Completed.
         * 
         *  Note(s):
         *    [1] This status means that the completion of the wait handle has 
         *        already been completed.
         * 
         *  @type {Number}
         */
        static STATUS_COMPLETED  = 1;

        /**
         *  Wait status: Cancelled.
         * 
         *  Note(s):
         *    [1] This status means that the cancellator function was called 
         *        before the completion of the wait handle goes to completed 
         *        status.
         * 
         *  @type {Number}
         */
        static STATUS_CANCELLED = 2;
    };
})();

/**
 *  Lightweight completion.
 * 
 *  @template T
 *  @constructor
 */
const LwCompletion = (function() {
    //
    //  Local type definitions.
    //

    /**
     *  @typedef {Object} TClassPrivateFields
     *  @property {Boolean} completed
     *    - True if completed.
     *  @property {T} completionValue
     *    - The completion value.
     *  @property {Set<() => void>} onCompleteCallbacks
     *    - Set of callbacks that would be invoked when goes to completed 
     *      status.
     */

    //
    //  Local constants.
    //

    /**
     *  Instance private fields.
     * 
     *  @type {WeakMap<InstanceType<typeof LwCompletion>, TClassPrivateFields>}
     */
    const INSTANCE_PRIVFIELDS = new WeakMap();

    //
    //  Class definition.
    //
    return class LwCompletion_ {
        //
        //  Constructor.
        //

        /**
         *  New object.
         */
        constructor() {
            INSTANCE_PRIVFIELDS.set(this, {
                "completed": false,
                "completionValue": null,
                "onCompleteCallbacks": new Set()
            });
        }

        //
        //  Public methods.
        //

        /**
         *  Wait for the completion to be completed.
         * 
         *  @param {Number} [flags] 
         *    - The wait flag (combination of WAITFLAG_{NOWAIT}, 0 if no 
         *      flag).
         *  @returns {?(InstanceType<typeof LwCompletion.WaitHandle><T>)}
         *    - The wait handle (NULL if WAITFLAG_NOWAIT flag is used and the 
         *      completion is currently not completed).
         */
        wait(flags = 0) {
            //  Get private fields.
            let privfields = INSTANCE_PRIVFIELDS.get(this);

            //  Fast path for completed completion.
            if (privfields.completed) {
                let wh = new LwCompletion.WaitHandle();
                wh.status = LwCompletion.WaitHandle.STATUS_COMPLETED;
                wh.handle = Promise.resolve(wh);
                wh.value = privfields.completionValue;
                wh.cancel = DUMMY_CALLBACK;
                return wh;
            }

            //  Handle NOWAIT flag.
            if ((flags & LwCompletion.WAITFLAG_NOWAIT) != 0) {
                return null;
            }

            //  Slow path for incomplete completion.
            let callbacks = privfields.onCompleteCallbacks;
            let wh = new LwCompletion.WaitHandle();
            let status = LwCompletion.WaitHandle.STATUS_AWAIT;
            wh.status = status;
            wh.handle = new Promise(function(resolve) {
                /**
                 *  Wait handle notifier.
                 */
                function _WaitHandle_Notify() {
                    //  Do not operate if not in AWAIT status.
                    if (status != LwCompletion.WaitHandle.STATUS_AWAIT) {
                        return;
                    }

                    //  Go to COMPLETED status.
                    status = LwCompletion.WaitHandle.STATUS_COMPLETED;
                    wh.status = status;

                    //  Save the completion value.
                    wh.value = privfields.completionValue;

                    //  Let the wait handle resolve.
                    resolve(wh);
                }

                //  Assign cancellator function.
                wh.cancel = function() {
                    //  Do not operate if not in AWAIT status.
                    if (status != LwCompletion.WaitHandle.STATUS_AWAIT) {
                        return;
                    }

                    //  Go to CANCELLED status.
                    status = LwCompletion.WaitHandle.STATUS_CANCELLED;
                    wh.status = status;

                    //  Detach the notifier.
                    callbacks.delete(_WaitHandle_Notify);

                    //  Let the wait handle resolve.
                    resolve(wh);
                };

                //  Attach the notifier.
                callbacks.add(_WaitHandle_Notify);
            });

            return wh;
        }

        /**
         *  Try to make the completion complete.
         * 
         *  @param {T} value 
         *    - The completion value.
         *  @returns {Boolean}
         *    - True if succeed.
         */
        complete(value = null) {
            //  Get private fields.
            let privfields = INSTANCE_PRIVFIELDS.get(this);

            //  Fail if already completed.
            if (privfields.completed) {
                return false;
            }

            //  Mark the completion as completed.
            privfields.completed = true;

            //  Save the completion value.
            privfields.completionValue = value;

            //  Invoke and detach all completion callbacks.
            for (let complete of privfields.onCompleteCallbacks) {
                complete();
            }
            privfields.onCompleteCallbacks.clear();

            return true;
        }

        //
        //  Public static members.
        //

        /**
         *  Wait handle.
         * 
         *  @constructor
         */
        static WaitHandle = LwCompletionWaitHandle;

        //
        //  Public static methods.
        //

        /**
         *  Wait for all specified completions to be completed.
         * 
         *  @param {InstanceType<typeof LwCompletion>[]} completions 
         *    - The completions.
         *  @param {Number} [flags] 
         *    - The wait flag (combination of WAITFLAG_{NOWAIT}, 0 if no 
         *      flag).
         *  @returns {?(InstanceType<typeof LwCompletion.WaitHandle><Object[]>)}
         *    - The wait handle (NULL if WAITFLAG_NOWAIT flag is used and the 
         *      completion is currently not completed).
         *    - The completion value of the returned wait handle is an array 
         *      that contains the completion values.
         */
        static WaitAll(completions, flags = 0) {
            //  Get the number of completions.
            let cnt = completions.length;

            //  Fast path for no completion.
            if (cnt == 0) {
                let wh = new LwCompletion.WaitHandle();
                wh.status = LwCompletion.WaitHandle.STATUS_COMPLETED;
                wh.handle = Promise.resolve(wh);
                wh.value = [];
                wh.cancel = DUMMY_CALLBACK;
                return wh;
            }

            //  Initiate the completion value array.
            let completionValues = [];

            //  Initiate the incomplete completion index set.
            /**
             *  @type {Set<Number>}
             */
            let incompletions = new Set();

            //  Initiate the incomplete completion wait callback array.
            /**
             *  @type {(()=>void)[]}
             */
            let incompleteWaitCallbacks = [];

            //  Initiate the completion private fields array.
            /**
             *  @type {TClassPrivateFields[]}
             */
            let privates = [];

            //  Prepare above arrays/set(s).
            for (let i = 0; i < cnt; ++i) {
                let privfields = INSTANCE_PRIVFIELDS.get(completions[i]);
                if (privfields.completed) {
                    completionValues.push(privfields.completionValue);
                } else {
                    completionValues.push(null);
                    incompletions.add(i);
                }
                incompleteWaitCallbacks.push(DUMMY_CALLBACK);
                privates.push(privfields);
            }

            //  Fast path for the condition that all completion are completed.
            if (incompletions.size == 0) {
                let wh = new LwCompletion.WaitHandle();
                wh.status = LwCompletion.WaitHandle.STATUS_COMPLETED;
                wh.handle = Promise.resolve(wh);
                wh.value = completionValues;
                wh.cancel = DUMMY_CALLBACK;
                return wh;
            }

            //  Handle NOWAIT flag.
            if ((flags & LwCompletion.WAITFLAG_NOWAIT) != 0) {
                return null;
            }

            //  Wait for all incomplete completions to be completed.
            let wh = new LwCompletion.WaitHandle();
            let status = LwCompletion.WaitHandle.STATUS_AWAIT;
            wh.status = status;
            wh.handle = new Promise(function(resolve) {
                //  Assign cancellator function.
                wh.cancel = function() {
                    //  Stop if not in AWAIT status.
                    if (status != LwCompletion.WaitHandle.STATUS_AWAIT) {
                        return;
                    }

                    //  Go to CANCELLED status.
                    status = LwCompletion.WaitHandle.STATUS_CANCELLED;
                    wh.status = status;

                    //  Detach all incomplete wait callbacks.
                    for (let i of incompletions) {
                        privates[i].onCompleteCallbacks.delete(
                            incompleteWaitCallbacks[i]
                        );
                    }

                    //  Let the wait handle resolve.
                    resolve(wh);
                };

                //  Attach wait callbacks to all incomplete completions.
                for (let i of incompletions) {
                    //  Get a local copy of the offset(index) of the incomplete 
                    //  completion.
                    let offset = i;

                    /**
                     *  Wait callback.
                     */
                    function _WaitCallback() {
                        //  Save the completion value.
                        completionValues[offset] = 
                            privates[offset].completionValue;
                        
                        //  Delete the completion from the incomplete completion
                        //  set.
                        incompletions.delete(offset);

                        //  Make the wait handle complete if there is no more 
                        //  incomplete completion.
                        if (incompletions.size == 0) {
                            //  Stop if not in AWAIT status.
                            if (
                                status != LwCompletion.WaitHandle.STATUS_AWAIT
                            ) {
                                return;
                            }

                            //  Go to COMPLETED status.
                            status = LwCompletion.WaitHandle.STATUS_COMPLETED;
                            wh.status = status;

                            //  Save the completion values.
                            wh.value = completionValues;

                            //  Let the wait handle resolve.
                            resolve(wh);
                        }
                    };

                    //  Attach the wait callback.
                    incompleteWaitCallbacks[offset] = _WaitCallback;
                    privates[offset].onCompleteCallbacks.add(_WaitCallback);
                }
            });

            return wh;
        }

        /**
         *  Wait for any one of specified completions to be completed.
         * 
         *  @param {InstanceType<typeof LwCompletion>[]} completions 
         *    - The completions.
         *  @param {Number} [flags] 
         *    - The wait flag (combination of WAITFLAG_{NOWAIT}, 0 if no 
         *      flag).
         *  @returns {?(InstanceType<typeof LwCompletion.WaitHandle><Number>)}
         *    - The wait handle (NULL if WAITFLAG_NOWAIT flag is used and the 
         *      completion is currently not completed).
         *    - The completion value of the returned wait handle is an integer 
         *      that indicates the offset of the completion with in the 
         *      completions array that makes the wait handle complete.
         */
        static WaitAny(completions, flags = 0) {
            //  Get the number of completions.
            let cnt = completions.length;

            //  Fast path for no completion.
            if (completions.length == 0) {
                //  Create a new wait handle that never complete but is 
                //  cancellable.
                let wh = new LwCompletion.WaitHandle();
                let status = LwCompletion.WaitHandle.STATUS_AWAIT;
                wh.status = status;
                wh.value = null;
                wh.handle = new Promise(function(resolve) {
                    wh.cancel = function() {
                        //  Stop if not in AWAIT status.
                        if (status != LwCompletion.WaitHandle.STATUS_AWAIT) {
                            return;
                        }

                        //  Go to CANCELLED status.
                        status = LwCompletion.WaitHandle.STATUS_CANCELLED;
                        wh.status = status;

                        //  Let the wait handle resolve.
                        resolve(wh);
                    };
                });

                return wh;
            }

            //  Initiate the incomplete completion wait callback array.
            /**
             *  @type {(()=>void)[]}
             */
            let incompleteWaitCallbacks = [];

            //  Initiate the completion private fields array.
            /**
             *  @type {TClassPrivateFields[]}
             */
            let privates = [];

            //  Prepare above arrays.
            for (let i = 0; i < cnt; ++i) {
                let privfields = INSTANCE_PRIVFIELDS.get(completions[i]);
                if (privfields.completed) {
                    //  Fast path for completed completion.
                    let wh = new LwCompletion.WaitHandle();
                    wh.status = LwCompletion.WaitHandle.STATUS_COMPLETED;
                    wh.handle = Promise.resolve(wh);
                    wh.value = i;
                    wh.cancel = DUMMY_CALLBACK;
                    return wh;
                }
                privates.push(privfields);
            }

            //  Handle NOWAIT flag.
            if ((flags & LwCompletion.WAITFLAG_NOWAIT) != 0) {
                return null;
            }

            //  Wait for any incomplete completion to be completed.
            let wh = new LwCompletion.WaitHandle();
            let status = LwCompletion.WaitHandle.STATUS_AWAIT;
            wh.status = status;
            wh.handle = new Promise(function(resolve) {
                //  Assign cancellator function.
                wh.cancel = function() {
                    //  Stop if not in AWAIT status.
                    if (status != LwCompletion.WaitHandle.STATUS_AWAIT) {
                        return;
                    }

                    //  Go to CANCELLED status.
                    status = LwCompletion.WaitHandle.STATUS_CANCELLED;
                    wh.status = status;

                    //  Detach all incomplete wait callbacks.
                    for (let i = 0; i < cnt; ++i) {
                        privates[i].onCompleteCallbacks.delete(
                            incompleteWaitCallbacks[i]
                        );
                    }

                    //  Let the wait handle resolve.
                    resolve(wh);
                };

                //  Attach incomplete wait callbacks.
                for (let i = 0; i < cnt; ++i) {
                    //  Get a local copy of the offset(index) of the incomplete 
                    //  completion.
                    let offset = i;

                    /**
                     *  Wait callback.
                     */
                    function _WaitCallback() {
                        //  Stop if not in AWAIT status.
                        if (status != LwCompletion.WaitHandle.STATUS_AWAIT) {
                            return;
                        }

                        //  Go to COMPLETED status.
                        status = LwCompletion.WaitHandle.STATUS_COMPLETED;
                        wh.status = status;

                        //  Save the offset as the completion value.
                        wh.value = offset;

                        //  Detach all other incomplete wait callbacks.
                        for (let j = 0; j < cnt; ++j) {
                            if (j != offset) {
                                privates[j].onCompleteCallbacks.delete(
                                    incompleteWaitCallbacks[j]
                                );
                            }
                        }

                        //  Let the wait handle resolve.
                        resolve(wh);
                    }

                    //  Attach incomplete wait callback.
                    incompleteWaitCallbacks.push(_WaitCallback);
                    privates[offset].onCompleteCallbacks.add(_WaitCallback);
                }
            });

            return wh;
        }

        //
        //  Public static constants.
        //

        /**
         *  Wait flag: No wait.
         * 
         *  @type {Number}
         */
        static WAITFLAG_NOWAIT = (1 << 0);
    };
})();

//  Export public APIs.
module.exports = {
    "LwCompletion": LwCompletion
};