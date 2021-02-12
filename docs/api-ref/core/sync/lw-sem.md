## API Reference

### (Module) Core.Synchronize

#### (Class) LwSemaphore.WaitHandle

Wait handle of lightweight semaphores.

##### (Static Constant) LwSemaphore.WaitHandle.STATUS_{AWAIT, ACQUIRED, CANCELLED}

Wait status.

<table>
<thead>
<th>Name</th><th>Type</th><th>Description</th><th>Notes</th>
</thead>
<tbody>
<tr>
<td><i>STATUS_AWAIT</i></td>
<td rowspan="3"><i>Number</i></td>
<td>Wait status: Awaiting.</td>
<td>
1. This status means that the waiter is still acquiring the semaphore.
</td>
</tr>
<tr>
<td><i>STATUS_ACQUIRED</i></td>
<td>Wait status: Acquired.</td>
<td>
1. This status means that the waiter acquired the semaphore.
</td>
</tr>
<tr>
<td><i>STATUS_CANCELLED</i></td>
<td>Wait status: Cancelled.</td>
<td>
1. This status means that the cancellator function was called before the waiter acquires the semaphore.
</td>
</tr>
</tbody>
</table>

##### (Member) LwSemaphore.WaitHandle.prototype.status

Wait status.

<u>Note(s)</u>:
  1. The value of this member can be one of *STATUS_{AWAIT, ACQUIRED, CANCELLED}*.

<u>Type</u>:
  - *Number*

##### (Member) LwSemaphore.WaitHandle.prototype.handle

Promise-based wait handle.

<u>Note(s)</u>:
  1. The promise-based wait handle resolves with *this* when leaves STATUS_AWAIT status.

<u>Type</u>:
  - *Promise&lt;LwSemaphore.WaitHandle&gt;*

##### (Member) LwSemaphore.WaitHandle.prototype.cancel

Cancellator function.

<u>Type</u>:
  - *() => void*

#### (Class) LwSemaphore

Lightweight semaphore.

##### (Static Constant) LwSemaphore.ACFLAG_{NOWAIT}

Acquire flag.

<table>
<thead>
<th>Name</th><th>Type</th><th>Description</th>
</thead>
<tbody>
<tr>
<td><i>ACFLAG_NOWAIT</i></td>
<td><i>Number</i></td>
<td>Acquire flag: No wait.</td>
</tr>
</tbody>
</table>

##### (Constructor) new LwSemaphore([initial = 0])

New object.

<u>Note(s)</u>:
  1. The value of *initial* parameter must be non-negative integer.

<u>Exception(s)</u>:
<table>
<thead>
<th>Exception Type</th><th>Exception Reason(s)</th>
</thead>
<tbody>
<tr><td><i>Error</i></td><td>Invalid initial semaphore value.</td></tr>
</tbody>
</table>

<u>Parameter(s)</u>:
<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>initial</i></td><td><i>Number</i></td><td>The initial semaphore value.</td></tr>
</tbody>
</table>

##### (Method) LwSemaphore.prototype.acquire([flags = 0])

Acquire the semaphore.

<u>Exception(s)</u>:
<table>
<thead>
<th>Exception Type</th><th>Exception Reason(s)</th>
</thead>
<tbody>
<tr><td><i>Error</i></td><td>Invalid acquire flags.</td></tr>
</tbody>
</table>

<u>Parameter(s)</u>:
<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>flags</i></td><td><i>Number</i></td><td>The acquire flag (combination of <i>ACFLAG_{NOWAIT}</i>, 0 if no flag).</td></tr>
</tbody>
</table>

<u>Return value</u>:
<table>
<thead>
<th>Return Value Type</th><th>Return Value Description</th>
</thead>
<tbody>
<tr><td><i>?(LwSemaphore.WaitHandle)</i></td><td>The wait handle (NULL if <i>ACFLAG_NOWAIT</i> flag is used and the semaphore can't be acquired immediately).</td></tr>
</tbody>
</table>

##### (Method) LwSemaphore.prototype.release()

Release the semaphore.

