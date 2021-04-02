//
//  Copyright 2021 The XRT Authors. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Imports.
//

//  Imported modules.
const CrAsyncLwTimeout = 
    require("./../core/asynchronize/lw-timeout");
const CrSyncLwEvFlags = 
    require("./../core/synchronize/lw-evflags");
const CrSyncLwSem = 
    require("./../core/synchronize/lw-sem");
const CrSyncLwCompletion = 
    require("./../core/synchronize/lw-completion");

//  Imported classes.
const LwTimeout = 
    CrAsyncLwTimeout.LwTimeout;
const LwEventFlags = 
    CrSyncLwEvFlags.LwEventFlags;
const LwSemaphore = 
    CrSyncLwSem.LwSemaphore;
const LwCompletion = 
    CrSyncLwCompletion.LwCompletion;

//  Export public APIs.
module.exports = {
    "Asynchronize": {
        "LwTimeout": LwTimeout
    },
    "Synchronize": {
        "LwEventFlags": LwEventFlags,
        "LwSemaphore": LwSemaphore,
        "LwCompletion": LwCompletion
    }
};