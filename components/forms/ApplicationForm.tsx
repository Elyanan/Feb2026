"use client";

import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { Loader2, Send, RotateCcw } from "lucide-react";
import { FormEvent, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ZodIssue } from "zod";

import { registration } from "@/config/site";
import { ApplicationError, getFormToken, submitApplication } from "@/lib/application-service";
import { ApplicationSuccess } from "./ApplicationSuccess";
import { applicationSchema, type ApplicationFormValues } from "@/lib/validation/application";
import { cn } from "@/lib/utils";

type Errors = Partial<Record<keyof ApplicationFormValues, string>>;
const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

const emptyValues: ApplicationFormValues = {
  fullName: "",
  grade: "",
  email: "",
  phone: "",
  motivation: "",
  area: "",
  speakerQuestion: ""
};

function errorMap(issues: ZodIssue[]) {
  return issues.reduce<Errors>((accumulator, issue) => {
    const key = issue.path[0] as keyof ApplicationFormValues | undefined;
    if (key && !accumulator[key]) accumulator[key] = issue.message;
    return accumulator;
  }, {});
}

type TextFieldProps = {
  label: string;
  name: keyof ApplicationFormValues;
  value: string;
  error?: string;
  autoComplete?: string;
  inputMode?: "email" | "tel" | "text";
  type?: string;
  onChange: (name: keyof ApplicationFormValues, value: string) => void;
};

function TextField({
  label,
  name,
  value,
  error,
  autoComplete,
  inputMode,
  type = "text",
  onChange
}: TextFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div>
      <label className="eyebrow text-[var(--stone)]" htmlFor={id}>
        {label}
      </label>
      <div className="focus-ring mt-3 border border-[var(--line)] bg-white/78">
        <input
          id={id}
          name={name}
          value={value}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          maxLength={name === "fullName" ? 120 : name === "email" ? 254 : 30}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="min-h-14 w-full bg-transparent px-4 text-base font-medium outline-none"
          onChange={(event) => onChange(name, event.target.value)}
        />
      </div>
      <FieldError id={errorId} error={error} />
    </div>
  );
}

type TextAreaProps = {
  label: string;
  name: keyof ApplicationFormValues;
  value: string;
  error?: string;
  placeholder?: string;
  onChange: (name: keyof ApplicationFormValues, value: string) => void;
};

function TextArea({ label, name, value, error, placeholder, onChange }: TextAreaProps) {
  const id = useId();
  const fieldId = name === "speakerQuestion" ? "speakerQuestion" : id;
  const errorId = `${id}-error`;

  return (
    <div>
      <label className="eyebrow text-[var(--stone)]" htmlFor={fieldId}>
        {label}
      </label>
      <div className="focus-ring mt-3 border border-[var(--line)] bg-white/78">
        <textarea
          id={fieldId}
          name={name}
          value={value}
          placeholder={placeholder}
          maxLength={name === "motivation" ? 3000 : 1500}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="min-h-32 w-full resize-y bg-transparent px-4 py-4 text-base font-medium leading-7 outline-none"
          onChange={(event) => onChange(name, event.target.value)}
        />
      </div>
      <FieldError id={errorId} error={error} />
    </div>
  );
}

function GradeSelect({
  value,
  error,
  onChange
}: {
  value: string;
  error?: string;
  onChange: (name: keyof ApplicationFormValues, value: string) => void;
}) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div>
      <label className="eyebrow text-[var(--stone)]" htmlFor={id}>
        Grade / year
      </label>
      <div className="focus-ring mt-3 border border-[var(--line)] bg-white/78">
        <select
          id={id}
          name="grade"
          value={value}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="min-h-14 w-full appearance-none bg-transparent px-4 text-base font-medium outline-none"
          onChange={(event) => onChange("grade", event.target.value)}
        >
          <option value="">Select</option>
          {registration.grades.map((grade) => (
            <option key={grade} value={grade}>
              {grade}
            </option>
          ))}
        </select>
      </div>
      <FieldError id={errorId} error={error} />
    </div>
  );
}

function AreaSelector({
  value,
  error,
  onChange
}: {
  value: string;
  error?: string;
  onChange: (name: keyof ApplicationFormValues, value: string) => void;
}) {
  const legendId = useId();
  const errorId = `${legendId}-error`;

  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      <legend id={legendId} className="eyebrow text-[var(--stone)]">
        Which area interests you most?
      </legend>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {registration.areas.map((area) => {
          const selected = value === area;
          return (
            <label
              key={area}
              className={cn(
                "focus-ring relative flex min-h-16 cursor-pointer items-center border bg-white/78 px-4 text-sm font-semibold transition",
                selected ? "border-[var(--green-700)] text-[var(--green-700)] shadow-[0_12px_34px_rgba(13,111,61,0.12)]" : "border-[var(--line)] hover:border-[var(--line-strong)]"
              )}
            >
              <input
                className="peer sr-only"
                type="radio"
                name="area"
                value={area}
                checked={selected}
                onChange={() => onChange("area", area)}
              />
              <span>{area}</span>
              <span
                className={cn(
                  "absolute right-4 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border transition",
                  selected ? "border-[var(--green-700)] bg-[var(--green-700)]" : "border-[var(--line-strong)]"
                )}
              />
            </label>
          );
        })}
      </div>
      <FieldError id={errorId} error={error} />
    </fieldset>
  );
}

function FieldError({ id, error }: { id: string; error?: string }) {
  return (
    <AnimatePresence initial={false}>
      {error ? (
        <motion.p
          id={id}
          role="alert"
          className="mt-2 text-sm font-semibold text-red-700"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
        >
          {error}
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}

export function ApplicationForm() {
  const hydrated = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const [values, setValues] = useState<ApplicationFormValues>(emptyValues);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "validation" | "submitting" | "success" | "duplicate" | "failure">("idle");
  const [formError, setFormError] = useState("");
  const token = useRef<Promise<string> | null>(null);
  const busy = useRef(false);
  const [website, setWebsite] = useState("");
  useEffect(() => {
    const pending = getFormToken();
    token.current = pending;
    void pending.catch(() => { if (token.current === pending) token.current = null; });
  }, []);
  const reduceMotion = useReducedMotion();
  const formRef = useRef<HTMLFormElement>(null);

  const completion = useMemo(() => {
    const completed = Object.values(values).filter(Boolean).length;
    return Math.round((completed / Object.keys(values).length) * 100);
  }, [values]);

  const updateValue = (name: keyof ApplicationFormValues, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy.current) return;
    setFormError("");

    const parsed = applicationSchema.safeParse(values);
    if (!parsed.success) {
      const nextErrors = errorMap(parsed.error.issues);
      setErrors(nextErrors);
      setStatus("validation");

      const firstKey = parsed.error.issues[0]?.path[0];
      if (firstKey && formRef.current) {
        const field = formRef.current.querySelector<HTMLElement>(`[name="${String(firstKey)}"]`);
        field?.focus();
      }
      return;
    }

    if (!registration.open) {
      setFormError("Applications are currently closed.");
      return;
    }

    busy.current = true;
    setStatus("submitting");
    try {
      if (!token.current) {
        const pending = getFormToken();
        token.current = pending;
        void pending.catch(() => { if (token.current === pending) token.current = null; });
        await pending;
        setStatus("failure");
        setFormError("Please wait a moment, then try submitting again. Your information is still here.");
        return;
      }
      await submitApplication(parsed.data, await token.current, website);
      setStatus("success");
    } catch (error) {
      setStatus(error instanceof ApplicationError && error.code === "duplicate" ? "duplicate" : "failure");
      setFormError(error instanceof ApplicationError ? error.message : "We couldn't submit your application. Your information is still here. Please try again.");
      if (error instanceof ApplicationError && error.errors) {
        setErrors(Object.fromEntries(Object.entries(error.errors).map(([key, messages]) => [key, messages[0]])));
      }
      if (error instanceof ApplicationError && error.code === "timing") {
        const pending = getFormToken();
        token.current = pending;
        void pending.catch(() => { token.current = null; });
      }
    } finally {
      busy.current = false;
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
    {status === "success" ? <ApplicationSuccess key="success" name={values.fullName.trim()} /> :
    <motion.form key="form" ref={formRef} noValidate className="mx-auto mt-12 max-w-4xl" onSubmit={onSubmit}
      exit={{ opacity: 0, y: reduceMotion ? 0 : -12 }} transition={{ duration: reduceMotion ? 0 : 0.3 }} aria-busy={status === "submitting"}>
      <fieldset disabled={!hydrated || status === "submitting"} className="min-w-0 disabled:opacity-70">
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor="registration-website">Website</label>
        <input id="registration-website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={event => setWebsite(event.target.value)} />
      </div>
      <div className="mb-8 border border-[var(--line)] bg-white/58 p-3">
        <div className="flex items-center justify-between gap-4 px-2 pb-3 text-xs font-bold uppercase tracking-[0.14em] text-[var(--stone)]">
          <span>Application progress</span>
          <span>{completion}%</span>
        </div>
        <div className="h-1 bg-[var(--line)]">
          <motion.div
            className="h-full bg-[var(--green-700)]"
            animate={{ width: `${completion}%` }}
            transition={{ duration: reduceMotion ? 0 : 0.35 }}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <TextField
          label="Full name"
          name="fullName"
          value={values.fullName}
          error={errors.fullName}
          autoComplete="name"
          onChange={updateValue}
        />
        <GradeSelect value={values.grade} error={errors.grade} onChange={updateValue} />
        <TextField
          label="Email address"
          name="email"
          value={values.email}
          error={errors.email}
          autoComplete="email"
          inputMode="email"
          type="email"
          onChange={updateValue}
        />
        <TextField
          label="Phone number"
          name="phone"
          value={values.phone}
          error={errors.phone}
          autoComplete="tel"
          inputMode="tel"
          type="tel"
          onChange={updateValue}
        />
      </div>

      <div className="mt-6 grid gap-6">
        <TextArea
          label="Why are you interested in this program?"
          name="motivation"
          value={values.motivation}
          error={errors.motivation}
          onChange={updateValue}
        />
        <AreaSelector value={values.area} error={errors.area} onChange={updateValue} />
        <TextArea
          label="If you met the corporate banker, what would you ask?"
          name="speakerQuestion"
          value={values.speakerQuestion}
          error={errors.speakerQuestion}
          placeholder="Type the one question you would ask."
          onChange={updateValue}
        />
      </div>

      {formError ? (
        <p className="mt-5 text-center text-sm font-semibold text-red-700" role="alert">
          {formError}
        </p>
      ) : null}

      <button className="btn btn-primary mt-8 w-full" type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? (
          <>
            <Loader2 className="animate-spin" size={17} aria-hidden="true" /> Sending application
          </>
        ) : (
          <>
            {status === "failure" ? "Try again" : "Submit application"} {status === "failure" ? <RotateCcw size={16} aria-hidden="true" /> : <Send size={16} aria-hidden="true" />}
          </>
        )}
      </button>
      </fieldset>
    </motion.form>}
    </AnimatePresence>
  );
}
