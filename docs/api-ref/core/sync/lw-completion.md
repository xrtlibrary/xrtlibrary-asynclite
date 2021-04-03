## API Reference

### (Module) Core.Synchronize

#### (Class) LwCompletion.WaitHandle&lt;T&gt;

Wait handle of lightweight completions.

##### (Static Constant) LwCompletion.WaitHandle.STATUS_{AWAIT, COMPLETED, CANCELLED}

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
1. This status means that the completion of the wait handle hasn't been completed yet.
</td>
</tr>
<tr>
<td><i>STATUS_COMPLETED</i></td>
<td>Wait status: Completed.</td>
<td>
1. This status means that the completion of the wait handle has already been completed.
</td>
</tr>
<tr>
<td><i>STATUS_CANCELLED</i></td>
<td>Wait status: Cancelled.</td>
<td>
1. This status means that the cancellator function was called before the completion of the wait handle goes to completed status.
</td>
</tr>
</tbody>
</table>

##### (Member) LwCompletion.WaitHandle.prototype.status

Wait status.

<u>Note(s)</u>:
  1. The value of this member can be one of *STATUS_{AWAIT, COMPLETED, CANCELLED}*.

<u>Type</u>:
  - *Number*

##### (Member) LwCompletion.WaitHandle.prototype.handle

Promise-based wait handle.

<u>Note(s)</u>:
  1. The promise-based wait handle resolves with *this* when leaves STATUS_AWAIT status.

<u>Type</u>:
  - *Promise&lt;LwCompletion.WaitHandle&lt;T&gt;&gt;*

##### (Member) LwCompletion.WaitHandle.prototype.value

Completion value.

<u>Type</u>:
  - *T*

##### (Member) LwCompletion.WaitHandle.prototype.cancel

Cancellator function.

<u>Type</u>:
  - *() => void*

#### (Class) LwCompletion&lt;T&gt;

Lightweight completion.

##### (Static Constant) LwCompletion.WAITFLAG_{NOWAIT}

Wait flag.

<table>
<thead>
<th>Name</th><th>Type</th><th>Description</th>
</thead>
<tbody>
<tr>
<td><i>WAITFLAG_NOWAIT</i></td>
<td><i>Number</i></td>
<td>Wait flag: No wait.</td>
</tr>
</tbody>
</table>

##### (Constructor) new LwCompletion()

New object.

##### (Method) LwCompletion.prototype.wait([flags = 0])

Wait for the completion to be completed.

<u>Parameter(s)</u>:
<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>flags</i></td><td><i>Number</i></td><td>The wait flag (combination of <i>WAITFLAG_{NOWAIT}</i>, 0 if no flag).</td></tr>
</tbody>
</table>

<u>Return value</u>:
<table>
<thead>
<th>Return Value Type</th><th>Return Value Description</th>
</thead>
<tbody>
<tr><td><i>?(LwCompletion.WaitHandle&lt;T&gt;)</i></td><td>The wait handle (NULL if <i>WAITFLAG_NOWAIT</i> flag is used and the completion is currently not completed).</td></tr>
</tbody>
</table>

##### (Method) LwCompletion.prototype.complete([value = null])

Try to make the completion complete.

<u>Parameter(s)</u>:
<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>value</i></td><td><i>T</i></td><td>The completion value.</td></tr>
</tbody>
</table>

<u>Return value</u>:
<table>
<thead>
<th>Return Value Type</th><th>Return Value Description</th>
</thead>
<tbody>
<tr><td><i>Boolean</i></td><td>True if succeed.</td></tr>
</tbody>
</table>

##### (Method) LwCompletion.prototype.isCompleted()

Get whether the completion was already completed.

<u>Return value</u>:
<table>
<thead>
<th>Return Value Type</th><th>Return Value Description</th>
</thead>
<tbody>
<tr><td><i>Boolean</i></td><td>True if so.</td></tr>
</tbody>
</table>

##### (Method) LwCompletion.prototype.getCompletionValue()

Get the completion value.

<u>Return value</u>:
<table>
<thead>
<th>Return Value Type</th><th>Return Value Description</th>
</thead>
<tbody>
<tr><td><i>?T</i></td><td>The completion value (NULL if not completed).</td></tr>
</tbody>
</table>

##### (Static Method) LwCompletion.WaitAll(completions[, flags = 0])

Wait for all specified completions to be completed.

<u>Parameter(s)</u>:
<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>completions</i></td><td><i>LwCompletion[]</i></td><td>The completions.</td></tr>
<tr><td><i>flags</i></td><td><i>Number</i></td><td>The wait flag (combination of <i>WAITFLAG_{NOWAIT}</i>, 0 if no flag).</td></tr>
</tbody>
</table>

<u>Return value</u>:
<table>
<thead>
<th>Return Value Type</th><th>Return Value Description</th>
</thead>
<tbody>
<tr><td><i>LwCompletion.WaitHandle&lt;Object[]&gt;</i></td><td><ul><li>The wait handle (NULL if <i>WAITFLAG_NOWAIT</i> flag is used and the completion is currently not completed).</li><li>The completion value of the returned wait handle is an array that contains the completion values.</li></ul></td></tr>
</tbody>
</table>

##### (Static Method) LwCompletion.WaitAny(completions[, flags = 0])

Wait for any one of specified completions to be completed.

<u>Parameter(s)</u>:
<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>completions</i></td><td><i>LwCompletion[]</i></td><td>The completions.</td></tr>
<tr><td><i>flags</i></td><td><i>Number</i></td><td>The wait flag (combination of <i>WAITFLAG_{NOWAIT}</i>, 0 if no flag).</td></tr>
</tbody>
</table>

<u>Return value</u>:
<table>
<thead>
<th>Return Value Type</th><th>Return Value Description</th>
</thead>
<tbody>
<tr><td><i>LwCompletion.WaitHandle&lt;Number&gt;</i></td><td><ul><li>The wait handle (NULL if <i>WAITFLAG_NOWAIT</i> flag is used and the completion is currently not completed).</li><li>The completion value of the returned wait handle is an integer that indicates the offset of the completion with in the completions array that makes the wait handle complete.</li></ul></td></tr>
</tbody>
</table>

