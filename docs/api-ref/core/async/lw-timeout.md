## API Reference

### (Module) Core.Asynchronize

#### (Class) LwTimeout

Lightweight timeout.

##### (Static Constant) LwTimeout.STATUS_{AWAIT, EXPIRED, CANCELLED}

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
1. This status means that the timeout timer is not expired.
</td>
</tr>
<tr>
<td><i>STATUS_EXPIRED</i></td>
<td>Wait status: Expired.</td>
<td>
1. This status means that the timeout timer was already expired.
</td>
</tr>
<tr>
<td><i>STATUS_CANCELLED</i></td>
<td>Wait status: Cancelled.</td>
<td>
1. This status means that the cancellator function was called before the timeout timer expires.
</td>
</tr>
</tbody>
</table>

##### (Member) LwTimeout.prototype.status

Wait status.

<u>Note(s)</u>:
 1. The value of this member can be one of *STATUS_{AWAIT, EXPIRED, CANCELLED}*.

<u>Type</u>:
  - *Number*

##### (Member) LwTimeout.prototype.handle

Promise-based wait handle.

<u>Note(s)</u>:
 1. The promise-based wait handle resolves with *this* when leaves *STATUS_AWAIT* status.

<u>Type</u>:
  - *Promise&lt;LwTimeout&gt;*

##### (Member) LwTimeout.prototype.cancel

Cancellator function.

<u>Type</u>:
  - *() => void*

##### (Static Method) LwTimeout.Delay(ms)

Delay for specific timespan.

<u>Note(s)</u>:
  1. The value of *ms* must be a non-negative integer (*Infinity* and *NaN* are not acceptable).

<u>Exception(s)</u>:
<table>
<thead>
<th>Exception Type</th><th>Exception Reason(s)</th>
</thead>
<tbody>
<tr><td><i>Error</i></td><td>Invalid delay timespan.</td></tr>
</tbody>
</table>

<u>Parameter(s)</u>:
<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>ms</i></td><td><i>Number</i></td><td>The delay timespan (unit: milliseconds).</td></tr>
</tbody>
</table>

<u>Return value</u>:
<table>
<thead>
<th>Return Value Type</th><th>Return Value Description</th>
</thead>
<tbody>
<tr><td><i>LwTimeout</i></td><td>The wait handle.</td></tr>
</tbody>
</table>

##### (Static Method) LwTimeout.WaitUntil(ts)

Wait until specified time.

<u>Note(s)</u>:
  1. The value of *ts* is the number of milliseconds elapsed since January 1, 1970 UTC, with leap seconds ignored.
  2. The value of *ts* can only be non-negative integer (*Infinity* and *NaN* are not acceptable).

<u>Exception(s)</u>:
<table>
<thead>
<th>Exception Type</th><th>Exception Reason(s)</th>
</thead>
<tbody>
<tr><td><i>Error</i></td><td>Invalid timestamp.</td></tr>
</tbody>
</table>

<u>Parameter(s)</u>:
<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>ts</i></td><td><i>Number</i></td><td>The timestamp.</td></tr>
</tbody>
</table>

<u>Return value</u>:
<table>
<thead>
<th>Return Value Type</th><th>Return Value Description</th>
</thead>
<tbody>
<tr><td><i>LwTimeout</i></td><td>The wait handle.</td></tr>
</tbody>
</table>

