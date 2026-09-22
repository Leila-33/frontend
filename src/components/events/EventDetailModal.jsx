export default function EventDetailModal({
    event,
    onClose
}) {


return (

<div
className="
modal
show
d-block
"
style={{
background:"rgba(0,0,0,.5)"
}}
>


<div className="
modal-dialog
modal-lg
">


<div className="
modal-content
rounded-4
">


<div className="modal-header">

<h5>
Détail événement
</h5>

<button
className="btn-close"
onClick={onClose}
/>

</div>



<div className="modal-body">


<p>
<b>Type :</b> {event.type}
</p>


<p>
<b>Date :</b>{" "}
{
new Date(
event.created_at
)
.toLocaleString()
}
</p>


<p>
<b>Message :</b>
<br/>
{event.message}
</p>



<hr/>


<h6>
Métadonnées
</h6>


<pre className="
bg-light
p-3
rounded
">

{
JSON.stringify(
event.event_metadata,
null,
2
)
}

</pre>


</div>



</div>

</div>

</div>

);

}