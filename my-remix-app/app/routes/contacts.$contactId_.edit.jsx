import { Form, useLoaderData, useNavigate } from "@remix-run/react";
import invariant from "tiny-invariant";
import { json, redirect } from "@remix-run/node";
import mongoose from "mongoose";



export async function loader({ params }) {
  invariant(params.contactId, "Missing contactId param");
  const contact = await mongoose.models.Contact.findById(params.contactId);
  if (!contact) {
    throw new Response("Contact not found", { status: 404 });
  }
  return json({ contact });
}

export default function EditContact() {
  const { contact } = useLoaderData();
  const navigate = useNavigate();

  return (
    <Form key={contact._id} id="contact-form" method="post">
      <p>
        <span>Name</span>
        <input
          defaultValue={contact.first}
          aria-label="First name"
          name="first"
          type="text"
          placeholder="First"
          className="p-2"
        />
        <input
          aria-label="Last name"
          defaultValue={contact.last}
          name="last"
          placeholder="Last"
          type="text"
          className="p-2"

        />
      </p>
      <label>
        <span>Twitter</span>
        <input 
          defaultValue={contact.twitter}
          name="twitter"
          placeholder="@jack"
          type="text"
          className="p-2"

        />
      </label>
      <label>
        <span>Avatar URL</span>
        <input
          aria-label="Avatar URL"
          defaultValue={contact.avatar}
          name="avatar"
          placeholder="https://example.com/avatar.jpg"
          type="text"
          className="p-2"

        />
      </label>
      
      <p>
        <button className="text-blue-500 p-2" type="submit">Save</button>
        <button className="p-2" onClick={() => navigate(-1)} type="button">
            Cancel
            </button>
      </p>
    </Form>
  );
}

export async function action({ params, request }) {
  invariant(params.contactId, "Missing contactId param");
  const formData = await request.formData();
  const contact = await mongoose.models.Contact.findById(params.contactId);
  if (!contact) {
    throw new Response("Contact not found", { status: 404 });
  }

contact.first = formData.get("first");
contact.last = formData.get("last");
contact.twitter = formData.get("twitter");
contact.avatar = formData.get("avatar");
await contact.save();
return redirect(`/contacts/${params.contactId}`);
}