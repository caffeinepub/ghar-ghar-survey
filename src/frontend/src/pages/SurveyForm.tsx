import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import CameraCapture from "../components/CameraCapture";
import SignaturePad from "../components/SignaturePad";
import {
  type SurveyEntry,
  getEntries,
  getSettings,
  saveEntry,
} from "../types/survey";

interface Props {
  surveyorName: string;
  surveyorPrincipal: string;
  editEntry?: SurveyEntry;
  onEditDone?: () => void;
}

const CLASSES = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "ड्रॉपआउट",
  "पढ़ नहीं रहा",
];

function calcAge(dob: string): string {
  if (!dob) return "";
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age > 0 ? String(age) : "";
}

const emptyForm = () => ({
  houseNo: "",
  wardNo: "",
  panchayat: "",
  headName: "",
  childName: "",
  fatherName: "",
  motherName: "",
  gender: "",
  caste: "",
  dob: "",
  age: "",
  studyingClass: "",
  studyingSchool: "",
  notStudyingReason: "",
  aadharNo: "",
  mobileNo: "",
  signature: "",
  photo: "",
});

function entryToForm(entry: SurveyEntry) {
  return {
    houseNo: entry.houseNo,
    wardNo: entry.wardNo,
    panchayat: entry.panchayat,
    headName: entry.headName,
    childName: entry.childName,
    fatherName: entry.fatherName,
    motherName: entry.motherName,
    gender: entry.gender,
    caste: entry.caste,
    dob: entry.dob,
    age: entry.age,
    studyingClass: entry.studyingClass,
    studyingSchool: entry.studyingSchool,
    notStudyingReason: entry.notStudyingReason,
    aadharNo: entry.aadharNo,
    mobileNo: entry.mobileNo,
    signature: entry.signature,
    photo: entry.photo,
  };
}

export default function SurveyForm({
  surveyorName,
  surveyorPrincipal,
  editEntry,
  onEditDone,
}: Props) {
  const isEditMode = !!editEntry;
  const settings = getSettings();
  const [form, setForm] = useState(() =>
    editEntry ? entryToForm(editEntry) : emptyForm(),
  );
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when editEntry changes
  useEffect(() => {
    if (editEntry) {
      setForm(entryToForm(editEntry));
      setSubmitted(false);
      setErrors({});
    } else {
      setForm(emptyForm());
      setSubmitted(false);
      setErrors({});
    }
  }, [editEntry]);

  const notStudying =
    form.studyingClass === "ड्रॉपआउट" || form.studyingClass === "पढ़ नहीं रहा";

  const nextSerial =
    getEntries().filter((e) => e.surveyorPrincipal === surveyorPrincipal)
      .length + 1;

  useEffect(() => {
    if (form.dob) {
      setForm((prev) => ({ ...prev, age: calcAge(form.dob) }));
    }
  }, [form.dob]);

  const set = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.childName.trim()) errs.childName = "बच्चे का नाम आवश्यक है";
    if (!form.fatherName.trim()) errs.fatherName = "पिता का नाम आवश्यक है";
    if (!form.gender) errs.gender = "लिंग चुनें";
    if (!form.caste) errs.caste = "जाति वर्ग चुनें";
    if (!form.dob) errs.dob = "जन्म तिथि आवश्यक है";
    if (!form.studyingClass) errs.studyingClass = "कक्षा चुनें";
    if (form.aadharNo && form.aadharNo.length !== 12)
      errs.aadharNo = "आधार नंबर 12 अंक का होना चाहिए";
    if (form.mobileNo && form.mobileNo.length !== 10)
      errs.mobileNo = "मोबाइल नंबर 10 अंक का होना चाहिए";
    if (!form.signature) errs.signature = "हस्ताक्षर आवश्यक है";
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error("कृपया सभी आवश्यक जानकारी भरें");
      return;
    }

    if (isEditMode && editEntry) {
      const updated: SurveyEntry = {
        id: editEntry.id,
        timestamp: editEntry.timestamp,
        surveyorPrincipal: editEntry.surveyorPrincipal,
        surveyorName: editEntry.surveyorName,
        schoolName: editEntry.schoolName,
        session: editEntry.session,
        serialNo: editEntry.serialNo,
        ...form,
      };
      saveEntry(updated);
      setSubmitted(true);
      toast.success("प्रविष्टि अपडेट हो गई");
    } else {
      const entry: SurveyEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        timestamp: new Date().toISOString(),
        surveyorPrincipal,
        surveyorName,
        schoolName: settings.schoolName,
        session: settings.session,
        serialNo: nextSerial,
        ...form,
      };
      saveEntry(entry);
      setSubmitted(true);
      toast.success("सर्वे सफलतापूर्वक सहेजा गया!");
    }
  };

  const handleNewEntry = () => {
    setForm(emptyForm());
    setErrors({});
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-6">
        <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-accent" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-display font-bold">
            {isEditMode ? "प्रविष्टि अपडेट हो गई" : "सर्वे सफलतापूर्वक सहेजा गया"}
          </h2>
          {!isEditMode && (
            <p className="text-muted-foreground mt-1">क्रम संख्या: {nextSerial}</p>
          )}
        </div>
        {isEditMode ? (
          <Button
            onClick={() => onEditDone?.()}
            className="w-full max-w-xs h-12"
            data-ocid="survey.submit_button"
          >
            वापस जाएं
          </Button>
        ) : (
          <Button onClick={handleNewEntry} className="w-full max-w-xs h-12">
            नई प्रविष्टि करें
          </Button>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      data-ocid="survey.form.panel"
      className="space-y-4 pb-8"
    >
      {/* Header info */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">विद्यालय:</span>
              <p className="font-medium">{settings.schoolName || "अज्ञात"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">सत्र:</span>
              <p className="font-medium">{settings.session}</p>
            </div>
            <div>
              <span className="text-muted-foreground">सर्वे कर्ता:</span>
              <p className="font-medium">{surveyorName}</p>
            </div>
            {!isEditMode && (
              <div>
                <span className="text-muted-foreground">क्रम संख्या:</span>
                <p className="font-bold text-primary">{nextSerial}</p>
              </div>
            )}
            {isEditMode && editEntry && (
              <div>
                <span className="text-muted-foreground">क्रम संख्या:</span>
                <p className="font-bold text-primary">{editEntry.serialNo}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location fields */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">स्थान की जानकारी</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="houseNo">घर संख्या</Label>
              <Input
                id="houseNo"
                value={form.houseNo}
                onChange={(e) => set("houseNo", e.target.value)}
                placeholder="घर नं."
                className="h-11"
                data-ocid="survey.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wardNo">वार्ड नंबर</Label>
              <Input
                id="wardNo"
                value={form.wardNo}
                onChange={(e) => set("wardNo", e.target.value)}
                placeholder="वार्ड नं."
                className="h-11"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="panchayat">पंचायत</Label>
            <Input
              id="panchayat"
              value={form.panchayat}
              onChange={(e) => set("panchayat", e.target.value)}
              placeholder="पंचायत का नाम"
              className="h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="headName">मुखिया का नाम</Label>
            <Input
              id="headName"
              value={form.headName}
              onChange={(e) => set("headName", e.target.value)}
              placeholder="परिवार के मुखिया का नाम"
              className="h-11"
            />
          </div>
        </CardContent>
      </Card>

      {/* Child info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">बच्चे की जानकारी</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="childName">
              बच्चे का नाम <span className="text-destructive">*</span>
            </Label>
            <Input
              id="childName"
              value={form.childName}
              onChange={(e) => set("childName", e.target.value)}
              placeholder="बच्चे का पूरा नाम"
              className="h-11"
            />
            {errors.childName && (
              <p
                className="text-xs text-destructive"
                data-ocid="survey.error_state"
              >
                {errors.childName}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="fatherName">
                पिता का नाम <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fatherName"
                value={form.fatherName}
                onChange={(e) => set("fatherName", e.target.value)}
                placeholder="पिता का नाम"
                className="h-11"
              />
              {errors.fatherName && (
                <p className="text-xs text-destructive">{errors.fatherName}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="motherName">माता का नाम</Label>
              <Input
                id="motherName"
                value={form.motherName}
                onChange={(e) => set("motherName", e.target.value)}
                placeholder="माता का नाम"
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>
              लिंग <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={form.gender}
              onValueChange={(v) => set("gender", v)}
              className="flex gap-4"
            >
              {["बालक", "बालिका", "अन्य"].map((g) => (
                <div key={g} className="flex items-center gap-2">
                  <RadioGroupItem value={g} id={`gender-${g}`} />
                  <Label htmlFor={`gender-${g}`} className="cursor-pointer">
                    {g}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {errors.gender && (
              <p className="text-xs text-destructive">{errors.gender}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>
              जाति वर्ग <span className="text-destructive">*</span>
            </Label>
            <Select value={form.caste} onValueChange={(v) => set("caste", v)}>
              <SelectTrigger className="h-11" data-ocid="survey.select">
                <SelectValue placeholder="जाति वर्ग चुनें" />
              </SelectTrigger>
              <SelectContent>
                {["सामान्य", "OBC", "SC", "ST"].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.caste && (
              <p className="text-xs text-destructive">{errors.caste}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="dob">
                जन्म तिथि <span className="text-destructive">*</span>
              </Label>
              <Input
                id="dob"
                type="date"
                value={form.dob}
                onChange={(e) => set("dob", e.target.value)}
                className="h-11"
              />
              {errors.dob && (
                <p className="text-xs text-destructive">{errors.dob}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="age">आयु (वर्ष)</Label>
              <Input
                id="age"
                type="number"
                value={form.age}
                onChange={(e) => set("age", e.target.value)}
                placeholder="आयु"
                className="h-11"
                min="0"
                max="30"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">शिक्षा की जानकारी</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>
              अध्ययनरत कक्षा <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.studyingClass}
              onValueChange={(v) => set("studyingClass", v)}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="कक्षा चुनें" />
              </SelectTrigger>
              <SelectContent>
                {CLASSES.map((c) => (
                  <SelectItem key={c} value={c}>
                    कक्षा {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.studyingClass && (
              <p className="text-xs text-destructive">{errors.studyingClass}</p>
            )}
          </div>

          {!notStudying && (
            <div className="space-y-1.5">
              <Label htmlFor="studyingSchool">अध्ययनरत विद्यालय</Label>
              <Input
                id="studyingSchool"
                value={form.studyingSchool}
                onChange={(e) => set("studyingSchool", e.target.value)}
                placeholder="विद्यालय का नाम"
                className="h-11"
              />
            </div>
          )}

          {notStudying && (
            <div className="space-y-1.5">
              <Label htmlFor="reason">अध्ययनरत नहीं होने का कारण</Label>
              <Textarea
                id="reason"
                value={form.notStudyingReason}
                onChange={(e) => set("notStudyingReason", e.target.value)}
                placeholder="कारण लिखें..."
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Identity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">पहचान की जानकारी</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="aadhar">आधार नंबर (12 अंक)</Label>
            <Input
              id="aadhar"
              type="number"
              value={form.aadharNo}
              onChange={(e) => set("aadharNo", e.target.value.slice(0, 12))}
              placeholder="XXXX XXXX XXXX"
              className="h-11 font-mono"
              data-ocid="survey.input"
            />
            {errors.aadharNo && (
              <p
                className="text-xs text-destructive"
                data-ocid="survey.error_state"
              >
                {errors.aadharNo}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mobile">मोबाइल नंबर (10 अंक)</Label>
            <Input
              id="mobile"
              type="tel"
              value={form.mobileNo}
              onChange={(e) =>
                set("mobileNo", e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              placeholder="XXXXXXXXXX"
              className="h-11 font-mono"
            />
            {errors.mobileNo && (
              <p className="text-xs text-destructive">{errors.mobileNo}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Signature */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            डिजिटल हस्ताक्षर <span className="text-destructive">*</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SignaturePad
            value={form.signature}
            onChange={(sig) => set("signature", sig)}
          />
          {errors.signature && (
            <p
              className="text-xs text-destructive mt-1"
              data-ocid="survey.error_state"
            >
              {errors.signature}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Live Photo */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">लाइव फोटो</CardTitle>
        </CardHeader>
        <CardContent>
          <CameraCapture
            value={form.photo}
            onChange={(photo) => set("photo", photo)}
          />
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="w-full h-14 text-base font-semibold"
        data-ocid="survey.submit_button"
      >
        {isEditMode ? "अपडेट करें" : "सर्वे जमा करें"}
      </Button>
    </form>
  );
}
