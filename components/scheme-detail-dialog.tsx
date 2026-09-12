"use client"

import { useState } from "react"
import { Check, FileText, MapPin, X } from "lucide-react"
import { toast } from "sonner"
import { inr, partners, type Scheme } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EmiCalculator } from "@/components/emi-calculator"

const API_URL = "https://schemesaathi-backend-s2l1.onrender.com"

export function SchemeDetailDialog({
  scheme,
  onOpenChange,
}: {
  scheme: Scheme | null
  onOpenChange: (v: boolean) => void
}) {
  const [showApplication, setShowApplication] = useState(false)

  const [applicantName, setApplicantName] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [category, setCategory] = useState("")
  const [amount, setAmount] = useState("")
  const [purpose, setPurpose] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!scheme) return null

  const eligible = scheme.eligibility.filter((e) => e.met).length
  const total = scheme.eligibility.length
  const isEligible = eligible === total

  const matchPartners = partners.filter((p) =>
    p.schemes.includes(scheme.id)
  )

  const handleApplicationSubmit = async () => {
    if (
      !applicantName.trim() ||
      !businessName.trim() ||
      !category ||
      !amount ||
      !purpose.trim()
    ) {
      toast.error("Please fill all required fields")
      return
    }

    const storedUser = localStorage.getItem("user")

    if (!storedUser) {
      toast.error("Please login first")
      return
    }

    let user

    try {
      user = JSON.parse(storedUser)
    } catch {
      toast.error("Unable to read logged-in user")
      return
    }

    if (!user.id) {
      toast.error("User information is missing")
      return
    }

    try {
      setIsSubmitting(true)

      const response = await fetch(`${API_URL}/api/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          applicantName: applicantName.trim(),
          businessName: businessName.trim(),
          category,
          amount: Number(amount),
          purpose: purpose.trim(),
          schemeId: scheme.id,
          schemeName: scheme.shortName ?? scheme.name,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit application")
      }

      toast.success("Application submitted successfully", {
        description: `Application ID: ${data.application.applicationId}`,
      })

      setApplicantName("")
      setBusinessName("")
      setCategory("")
      setAmount("")
      setPurpose("")
      setShowApplication(false)
    } catch (error) {
      console.error("Application submission error:", error)

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit application"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Dialog open={!!scheme && !showApplication} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90svh] gap-0 overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{scheme.category}</Badge>

              {scheme.match != null && (
                <Badge className="bg-success/15 text-success hover:bg-success/15">
                  {scheme.match}% Match
                </Badge>
              )}
            </div>

            <DialogTitle className="text-xl">
              {scheme.name}
            </DialogTitle>

            <DialogDescription>
              {scheme.ministry}
            </DialogDescription>
          </DialogHeader>

          <p className="mt-2 text-sm text-muted-foreground">
            {scheme.summary}
          </p>

          {/* Scheme Information */}
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <InfoTile
              label="Loan range"
              value={`${inr(scheme.minAmount)} – ${inr(scheme.maxAmount)}`}
            />

            <InfoTile
              label="Interest"
              value={
                scheme.interestRate === 0
                  ? "Grant / Subsidy"
                  : `${scheme.interestRate}% p.a.`
              }
            />

            <InfoTile
              label="Max tenure"
              value={
                scheme.maxTenureMonths === 0
                  ? "N/A"
                  : `${scheme.maxTenureMonths} months`
              }
            />
          </div>

          {/* Eligibility Result */}
          <div
            className={`mt-6 rounded-xl border p-4 ${
              isEligible
                ? "border-success/30 bg-success/10"
                : "border-destructive/30 bg-destructive/10"
            }`}
          >
            <p
              className={`font-semibold ${
                isEligible
                  ? "text-success"
                  : "text-destructive"
              }`}
            >
              {isEligible
                ? "✓ You are eligible for this scheme"
                : "✕ You may not be eligible for this scheme"}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {eligible} out of {total} eligibility criteria are currently met.
            </p>
          </div>

          {/* Eligibility Details */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold">
              Eligibility check{" "}
              <span className="text-muted-foreground">
                ({eligible}/{total} criteria met)
              </span>
            </h4>

            <ul className="mt-3 space-y-2">
              {scheme.eligibility.map((e) => (
                <li
                  key={e.label}
                  className="flex items-start gap-3 rounded-lg border border-border p-3"
                >
                  <span
                    className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${
                      e.met
                        ? "bg-success/15 text-success"
                        : "bg-destructive/15 text-destructive"
                    }`}
                  >
                    {e.met ? (
                      <Check className="size-3.5" />
                    ) : (
                      <X className="size-3.5" />
                    )}
                  </span>

                  <span>
                    <span className="block text-sm font-medium">
                      {e.label}
                    </span>

                    <span className="block text-xs text-muted-foreground">
                      {e.detail}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Required Documents */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold">
              Required documents
            </h4>

            <div className="mt-3 flex flex-wrap gap-2">
              {scheme.documents.map((d) => (
                <span
                  key={d}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs"
                >
                  <FileText className="size-3.5 text-muted-foreground" />
                  {d}
                </span>
              ))}
            </div>
          </div>

          {/* EMI Calculator */}
          {scheme.interestRate > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold">
                Plan your finances
              </h4>

              <div className="mt-3">
                <EmiCalculator scheme={scheme} compact />
              </div>
            </div>
          )}

          {/* Nearby Partners */}
          {matchPartners.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold">
                Nearby processing partners
              </h4>

              <div className="mt-3 space-y-2">
                {matchPartners.slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="size-4 text-primary" />

                      <span className="font-medium">
                        {p.name}
                      </span>
                    </div>

                    <span className="text-xs text-muted-foreground">
                      {p.distanceKm} km · {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              className="flex-1"
              onClick={() => {
                setApplicantName("")
                setBusinessName("")
                setCategory(scheme.category)
                setAmount(String(scheme.minAmount || 500000))
                setPurpose("")
                setShowApplication(true)
              }}
            >
              Apply for this scheme
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                toast("Saved to your schemes", {
                  description: scheme.name,
                })
              }
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Application Form */}
      <Dialog
        open={showApplication}
        onOpenChange={setShowApplication}
      >
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              Apply for {scheme.shortName ?? scheme.name}
            </DialogTitle>

            <DialogDescription>
              Fill in your basic details to start your application.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Applicant Name */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Applicant Name
              </label>

              <input
                type="text"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Business Name */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Business / Enterprise Name
              </label>

              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Enter business name"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Business Category */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Business Category
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select category</option>
                <option value="Business">Business</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Education">Education</option>
                <option value="Housing">Housing</option>
                <option value="Healthcare">Healthcare</option>
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Required Amount
              </label>

              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter required amount"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Purpose */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Purpose of Loan
              </label>

              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Describe how you will use the funds..."
                rows={3}
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Documents */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Required Documents
              </label>

              <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="size-4 text-muted-foreground" />

                  <span className="text-muted-foreground">
                    Documents will be uploaded in the next step.
                  </span>
                </div>
              </div>
            </div>

            {/* Submit */}
            <Button
              className="w-full"
              onClick={handleApplicationSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Submitting..."
                : "Continue Application"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function InfoTile({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg bg-muted p-3">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="text-sm font-semibold">
        {value}
      </p>
    </div>
  )
}