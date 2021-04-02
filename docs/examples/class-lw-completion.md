## Examples

### Completion

These examples will demostrate how to use *LwCompletion* class.

#### Example 1: Basic usage

To create a completion, simply use `new` statement:

```
let cp = new LwCompletion();
```

Use *wait()* method to wait for the completion to be completed:

```
let wh = cp.wait();
await wh.handle;
console.log("The completion completed.");
```

To make the completion complete, use *complete()* method. In this example, we would complete the completion after 500ms:

```
setTimeout(function() {
    cp.complete();
}, 500);
```

#### Example 2: Cancel waiting.

The *cancel()* method (i.e. *cancel* property which is a *Function* instance) of a *LwCompletion.WaitHandle* instance can be used to cancel waiting.

Use the *status* property of the *LwCompletion.WaitHandle* instance to determine whether the *LwCompletion.WaitHandle.prototype.handle* is resolved due to completion of the *LwCompletion* (or being cancelled):

```
...
await wh.handle;
if (wh.status == LwCompletion.WaitHandle.STATUS_CANCELLED) {
    console.log("Operation cancelled.");
} else if (wh.status == LwCompletion.WaitHandle.STATUS_COMPLETED) {
    console.log("The completion completed.");
} else {
    //  Unreachable.
}
```

