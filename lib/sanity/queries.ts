import "server-only";
export const emailExistsQuery = `count(*[_type == "registration" && email == $email]) > 0`;
export const registrationPredicate = `_type == "registration" && !(_id in path("drafts.**")) && (!defined($status) || status == $status) && (!defined($grade) || grade == $grade) && (!defined($area) || area == $area) && ($search == "" || fullName match $search || email match $search || phone match $search || grade match $search || area match $search || motivation match $search || speakerQuestion match $search)`;
export const summaryProjection = `_id, _rev, fullName, grade, email, phone, area, status, submittedAt`;
export const detailProjection = `${summaryProjection}, motivation, speakerQuestion, source, createdAt, updatedAt, adminNotes`;
export const registrationByIdQuery = `*[_type == "registration" && _id == $id][0]{${detailProjection}}`;
