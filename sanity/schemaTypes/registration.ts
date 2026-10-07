import { defineField, defineType } from "sanity";
import { areas, grades, statuses } from "@/lib/validation/registration-options";

export const registrationType = defineType({
  name: "registration", title: "Registration", type: "document",
  fields: [
    defineField({ name: "fullName", title: "Full name", type: "string", validation: r => r.required().min(2).max(120) }),
    defineField({ name: "grade", type: "string", options: { list: [...grades] }, validation: r => r.required().custom(value => grades.some(item => item === value) || "Select an allowed grade.") }),
    defineField({ name: "email", type: "string", validation: r => r.required().email().max(254) }),
    defineField({ name: "phone", type: "string", validation: r => r.required().min(7).max(30) }),
    defineField({ name: "motivation", type: "text", rows: 5, validation: r => r.required().min(20).max(3000) }),
    defineField({ name: "area", type: "string", options: { list: [...areas] }, validation: r => r.required().custom(value => areas.some(item => item === value) || "Select an allowed area.") }),
    defineField({ name: "speakerQuestion", title: "Speaker question", type: "text", rows: 3, validation: r => r.required().min(10).max(1500) }),
    defineField({ name: "submittedAt", type: "datetime", readOnly: true }),
    defineField({ name: "source", type: "string", readOnly: true }),
    defineField({ name: "status", type: "string", initialValue: "Pending", options: { list: [...statuses], layout: "radio" }, validation: r => r.required().custom(value => statuses.some(item => item === value) || "Select an allowed status.") }),
    defineField({ name: "createdAt", type: "datetime", readOnly: true }),
    defineField({ name: "updatedAt", type: "datetime", readOnly: true, description: "Application metadata. Sanity's _updatedAt tracks Studio edits." }),
    defineField({ name: "adminNotes", title: "Admin notes", type: "text", rows: 3, validation: r => r.max(5000) })
  ],
  orderings: [{ title: "Newest submissions", name: "submittedDesc", by: [{ field: "submittedAt", direction: "desc" }] }],
  preview: {
    select: { title: "fullName", grade: "grade", status: "status", date: "submittedAt" },
    prepare({ title, grade, status, date }) {
      return { title: title || "Unnamed applicant", subtitle: `${grade || "No grade"} | ${status || "Pending"} | ${date ? new Date(date).toLocaleDateString() : "No date"}` };
    }
  }
});
