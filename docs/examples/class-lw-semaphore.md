## Examples

### Semaphore

These examples will demostrate how to use *LwSemaphore* class.

#### Example 1: Basic usage

To create a semaphore, simply use `new` statement to create an instance of *LwSemaphore* class (the initial semaphore value can be specified in the parameter of the constructor):

```
//  With initial semaphore 1, the semaphore behaves like a lock.
let sem = new LwSemaphore(1);
```

To acquire the semaphore (decrease the semaphore value by 1 if the semaphore value is positive, o wait until the semaphore value is positive), call the *acquire()* method to get an instance of *LwSemaphore.WaitHandle* class which has an awaitable *Promise* object stored in its *handle* property:

```
let wh = sem.acquire();
await wh.handle;
```

To release the semaphore (increase the semaphore value by 1), call the *release()* method:

```
sem.release();
```

#### Example 2: Acquire a semaphore synchonously

To acquire a semaphoe synchronously (i.e. without waiting), call the *acquire()* method with *ACFLAG_NOWAIT* flag:

```
let sem = new LwSemaphore(1);
let wh = sem.acquire(LwSemaphore.ACFLAG_NOWAIT);
```

With the *ACFLAG_NOWAIT* flag, if the semaphore value is zero, *NULL* would be returned, otherwise an instance of *LwSemaphore.WaitHandle* class would be returned:

```
if (wh === null) {
    console.log("acquire() failed.");
}
```

#### Example 3: Cancel waiting

The *cancel()* method (i.e. *cancel* property which is a *Function* instance) of a *LwSemaphore.WaitHandle* instance can be used to cancel waiting.

Use the *status* property of the *LwSemaphore.WaitHandle* instance to determine whether the *LwSemaphore.WaitHandle.prototype.handle* is resolved due to acquisition of the semaphore (or being cancelled):

```
let wh = sem.acquire();
await wh.handle;
if (wh.status == LwSemaphore.WaitHandle.STATUS_CANCELLED) {
    console.log("Operation cancelled.");
} else if (wh.status == LwSemaphore.WaitHandle.STATUS_ACQUIRED) {
    console.log("Acquired the semaphore.");
} else {
    //  Unreachable.
}
```

