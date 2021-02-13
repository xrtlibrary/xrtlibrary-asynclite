## Examples

### Timeout

These examples will demostrate how to use *LwTimeout* class.

#### Example 1: Wait for specified timespan.

This example demostates how to wait for 1000 milliseconds.

To create an instance of *LwTimeout* class that waits fo specified timespan, call *LwTimeout.Delay()* method:

```
let tmo = LwTimeout.Delay(1000);
```

The *handle* property of the *LwTimeout* instance is an awaitable *Promise* object, use `await` statement to wait:

```
console.log("Waiting...");
await tmo.handle;
console.log("1000ms elapsed.");
```

#### Example 2: Wait until specified time.

This example demostrates how to wait until specified timestamp.

To create an instance of *LwTimeout* class that waits until specified timestamp, call *LwTimeout.WaitUntil()* method:

```
let ts = Date.now() + 1000;
let tmo = LwTimeout.WaitUntil(ts);
```

To wait until the timestamp, `await` just like previous example.

#### Example 3: Cancel waiting.

The *cancel()* method (i.e. *cancel* property which is a *Function* instance) of a *LwTimeout* instance can be used to cancel waiting.

To demostrate, let's create a *LwTimeout* that waits for 1000 milliseconds:

```
let tmo = LwTimeout.Delay(1000);
```

And then cancel when 500 milliseconds elapse:

```
setTimeout(function() {
    tmo.cancel();
}, 500);
```

Use the *status* property of the *LwTimeout* instance to determine whether the *LwTimeout.prototype.handle* is resolved due to timer elapsed (or being cancelled).

```
await tmo.handle;
if (tmo.status == LwTimeout.STATUS_CANCELLED) {
    console.log("Operation cancelled.");
} else if (tmo.status == LwTimeout.STATUS_EXPIRED) {
    console.log("1000 milliseconds elapsed.");
} else {
    //  Unreachable.
}
```

