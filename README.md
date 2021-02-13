## XRTLibrary-AsyncLite

### Introduction

This library is a lited(lightweight) version of `xtlibrary-async` library ([npm](https://www.npmjs.com/package/xrtlibrary-async), [Internal Git repository](https://git-private.xiaojsoft.org/xrtlibrary/xrtlibrary-async)), it provides lightweight equivalents of several functions of the origin library, see following table:

<table>
<thead>
<th>Class Name</th><th>Equivlent Class in the Origin Library</th>
</thead>
<tbody>
<tr><td rowspan="2"><a href="docs/api-ref/core/sync/lw-sem.md">LwSemaphore</a></td><td><a href="https://git-private.xiaojsoft.org/xrtlibrary/xrtlibrary-async#%28class%29-slimsemaphoresynchronizer">SlimSemaphoreSynchronizer</a> (internal repository link)</td></tr>
<tr><td><a href="https://git-private.xiaojsoft.org/xrtlibrary/xrtlibrary-async#%28class%29-semaphoresynchronizer">SemaphoreSynchronizer</a> (internal repository link)</td></tr>
<tr><td rowspan="2"><a href="docs/api-ref/core/sync/lw-evflags.md">LwEventFlags</a></td><td><a href="https://git-private.xiaojsoft.org/xrtlibrary/xrtlibrary-async#%28class%29-slimeventflags">SlimEventFlags</a> (internal repository link)</td></tr>
<tr><td><a href="https://git-private.xiaojsoft.org/xrtlibrary/xrtlibrary-async#%28class%29-eventflags">EventFlags</a> (internal repository link)</td></tr>
<tr><td><a href="docs/api-ref/core/async/lw-timeout.md">LwTimeout</a></td><td><a href="https://git-private.xiaojsoft.org/xrtlibrary/xrtlibrary-async#createtimeoutpromise%28timespan%2c-%5bvalue%5d%29">CreateTimeoutPromise()</a> (internal repository link)</td></tr>
</tbody>
</table>

The keyword `Lw` is the abbreviation of `Lightweight`, it has following meanings:
  - No custom *Error* class.
  - Use *status* property to indicate wait handle status instead of throwing a *OperationCancelledError*.
  - Use cancellation function instead of passing a *ConditionalSynchronizer* instance as a cancellator.
  - Provides synchronous mechanism to acquire certain resource if possible.

All efforts that we made in this library is to enhance the performance of the origin `xrtlibrary-async` library.

### Requirements

This library is built for Node.JS major version 10 and above. You may use this library under version 10 but we can't guarantee that this library behaves correctly.

### Installation

To install this library, use `npm` command to install:

```
npm install xrtlibrary-asynclite --save
```

And then you can import this library:

```
const XRTLibAsyncLite = require("xrtlibrary-asynclite");
```

### Documents

[API Reference](docs/api-ref/index.md)

[Examples](docs/examples/index.md)

### Authors

This library is delivered to you by XRT authors:

<table>
<thead>
<th>Author</th><th>Mail Address</th>
</thead>
<tbody>
<tr><td>Suwa Mitsuo</td><td><a href="mailto://suwa-mitsuo@outlook.com">suwa-mitsuo@outlook.com</a></td></tr>
</tbody>
</table>

