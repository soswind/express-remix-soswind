import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import mongoose from "mongoose";

export async function action({ params }) {
  invariant(params.contactId, "Missing contactId param");
  await mongoose.models.Contact.findByIdAndDelete(params.contactId);
  return redirect("/");
}

