## API Reference

### (Module) Core.Synchronize

#### (Class) LwEventFlags.WaitHandle

Wait handle of lightweight event flags.

##### (Static Constant) LwEventFlags.WaitHandle.STATUS_{AWAIT, SATISFIED, CANCELLED}

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
1. This status means that the condition of the wait handle hasn't been satisfied yet.
</td>
</tr>
<tr>
<td><i>STATUS_SATISFIED</i></td>
<td>Wait status: Satisfied.</td>
<td>
1. This status means that the condition of the wait handle has already been satisfied.
</td>
</tr>
<tr>
<td><i>STATUS_CANCELLED</i></td>
<td>Wait status: Cancelled.</td>
<td>
1. This status means that the cancellator function was called before the condition of the wait handle satisfies.
</td>
</tr>
</tbody>
</table>

##### (Member) LwEventFlags.WaitHandle.prototype.status

Wait status.

<u>Note(s)</u>:
  1. The value of this member can be one of *STATUS_{AWAIT, SATISFIED, CANCELLED}*.

<u>Type</u>:
  - *Number*

##### (Member) LwEventFlags.WaitHandle.prototype.value

Flag value at the time that this wait handle satisfies.

<u>Type</u>:
  - *Number*

##### (Member) LwEventFlags.WaitHandle.prototype.handle

Promise-based wait handle.

<u>Note(s)</u>:
  1. The promise-based wait handle resolves with *this* when leaves STATUS_AWAIT status.

<u>Type</u>:
  - *Promise&lt;LwEventFlags.WaitHandle&gt;*

##### (Member) LwEventFlags.WaitHandle.prototype.cancel

Cancellator function.

<u>Type</u>:
  - *() => void*

#### (Class) LwEventFlags

Lightweight event flags.

##### (Static Constant) LwEventFlags.PENDOP_{CLR_ALL, CLR_ANY, SET_ALL, SET_ANY}

Pending operation.

<table>
<thead>
<th>Name</th><th>Type</th><th>Description</th><th>Notes</th>
</thead>
<tbody>
<tr>
<td><i>PENDOP_CLR_ALL</i></td>
<td rowspan="4"><i>Number</i></td>
<td>Pending operation: All bits cleared.</td>
<td>
1. This operation means that the pending condition would become satisfied once all selected bits of the flag value are cleared (=&gt; 0).
</td>
</tr>
<tr>
<td><i>PENDOP_CLR_ANY</i></td>
<td>Pending operation: Any bit cleared.</td>
<td>
2. This operation means that the pending condition would become satisfied once any of selected bits of the flag value is cleared (=&gt; 0).
</td>
</tr>
<tr>
<td><i>PENDOP_SET_ALL</i></td>
<td>Pending operation: All bits set.</td>
<td>
3. This operation means that the pending condition would become satisfied once all selected bits of the flag value are set (=&gt; 1).
</td>
</tr>
<tr>
<td><i>PENDOP_SET_ANY</i></td>
<td>Pending operation: Any bit set.</td>
<td>
5. This operation means that the pending condition would become satisfied once any of selected bits of the flag value is set (=&gt; 1).
</td>
</tr>
</tbody>
</table>

##### (Static Constant) LwEventFlags.PENDFLAG_{CONSUME, NOWAIT}

Pending flag.

<table>
<thead>
<th>Name</th><th>Type</th><th>Description</th>
</thead>
<tbody>
<tr>
<td><i>PENDFLAG_CONSUME</i></td>
<td rowspan="2"><i>Number</i></td>
<td>Pending flag: Consume bit changes.</td>
</tr>
<tr>
<td><i>PENDFLAG_NOWAIT</i></td>
<td>Pending flag: No wait.</td>
</tr>
</tbody>
</table>

##### (Static Constant) LwEventFlags.POSTOP_{CLR, SET, FLIP}

Post operation.

<table>
<thead>
<th>Name</th><th>Type</th><th>Description</th><th>Notes</th>
</thead>
<tbody>
<tr>
<td><i>POSTOP_CLR</i></td>
<td rowspan="3"><i>Number</i></td>
<td>Post operation: Clear selected bits.</td>
<td>
1. This operation means that selected bits of the flag value would be cleared (=&gt; 0).
</td>
</tr>
<tr>
<td><i>POSTOP_SET</i></td>
<td>Post operation: Set selected bits.</td>
<td>
1. This operation means that selected bits of the flag value would be set (=&gt; 1).
</td>
</tr>
<tr>
<td><i>POSTOP_FLIP</i></td>
<td>Post operation: Flip selected bits.</td>
<td>
1. This operation means that selected bits of the flag value would be flipped (0 =&gt; 1, 1 =&gt; 0).
</td>
</tr>
</tbody>
</table>

##### (Constructor) new LwEventFlags([initial = 0])

New object.

<u>Note(s)</u>:
  1. The value of *initial* parameter must be an integer between 0x00000000 and 0xFFFFFFFF.

<u>Exception(s)</u>:
<table>
<thead>
<th>Exception Type</th><th>Exception Reason(s)</th>
</thead>
<tbody>
<tr><td><i>Error</i></td><td>Invalid initial flag value.</td></tr>
</tbody>
</table>

<u>Parameter(s)</u>:
<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>initial</i></td><td><i>Number</i></td><td>The initial flag value.</td></tr>
</tbody>
</table>

##### (Method) LwEventFlags.prototype.pend(bits, op[, flags = 0])

Pend on selected bits.

<u>Note(s)</u>:
  1. The value of *bits* parameter must be an integer between 0x00000000 and 0xFFFFFFFF. Set correlated bit of *bits* to 1 if that bit is selected.

<u>Exception(s)</u>:
<table>
<thead>
<th>Exception Type</th><th>Exception Reason(s)</th>
</thead>
<tbody>
<tr><td rowspan="3"><i>Error</i></td><td>Invalid bits selection.</td></tr>
<tr><td>Invalid pending operation.</td></tr>
<tr><td>Invalid pending flags.</td></tr>
</tbody>
</table>

<u>Parameter(s)</u>:
<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>bits</i></td><td rowspan="3"><i>Number</i></td><td>The selected bits.</td></tr>
<tr><td><i>op</i></td><td>The pending operation (one of <i>PENDOP_{CLR_ALL, CLR_ANY, SET_ALL, SET_ANY}</i>).</td></tr>
<tr><td><i>flags</i></td><td>The pending flag (combination of <i>PENDFLAG_{CONSUME, NOWAIT}</i>, 0 if no flag).</td></tr>
</tbody>
</table>

<u>Return value</u>:
<table>
<thead>
<th>Return Value Type</th><th>Return Value Description</th>
</thead>
<tbody>
<tr><td><i>?(LwEventFlags.WaitHandle)</i></td><td>The wait handle (NULL if <i>PENDFLAG_NOWAIT</i> flag is used and the pending condition can't be satisified immediately).</td></tr>
</tbody>
</table>

##### (Method) LwEventFlags.prototype.post(bits, op)

Post on selected bits.

<u>Note(s)</u>:
  1. The value of *bits* parameter must be an integer between 0x00000000 and 0xFFFFFFFF. Set correlated bit of *bits* to 1 if that bit is selected.

<u>Exception(s)</u>:
<table>
<thead>
<th>Exception Type</th><th>Exception Reason(s)</th>
</thead>
<tbody>
<tr><td rowspan="2"><i>Error</i></td><td>Invalid bits selection.</td></tr>
<tr><td>Invalid post operation.</td></tr>
</tbody>
</table>

<u>Parameter(s)</u>:
<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>bits</i></td><td rowspan="2"><i>Number</i></td><td>The selected bits.</td></tr>
<tr><td><i>op</i></td><td>The post operation (one of <i>POSTOP_{CLR, SET}</i>).</td></tr>
</tbody>
</table>

<u>Return value</u>:
<table>
<thead>
<th>Return Value Type</th><th>Return Value Description</th>
</thead>
<tbody>
<tr><td><i>LwEventFlags</i></td><td><i>this</i> for method chaining.</td></tr>
</tbody>
</table>

