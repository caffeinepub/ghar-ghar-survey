import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  FileSpreadsheet,
  Pencil,
  Printer,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  type SurveyEntry,
  deleteEntry,
  getEntries,
  getSettings,
} from "../types/survey";

interface Props {
  isAdmin: boolean;
  surveyorPrincipal: string;
  onEdit: (entry: SurveyEntry) => void;
}

export default function EntriesList({
  isAdmin,
  surveyorPrincipal,
  onEdit,
}: Props) {
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState<SurveyEntry[]>(() => getEntries());
  const settings = getSettings();

  const refresh = () => setEntries(getEntries());

  const filtered = useMemo(() => {
    let list = isAdmin
      ? entries
      : entries.filter((e) => e.surveyorPrincipal === surveyorPrincipal);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.childName.toLowerCase().includes(q) ||
          e.fatherName.toLowerCase().includes(q) ||
          e.wardNo.toLowerCase().includes(q) ||
          e.panchayat.toLowerCase().includes(q) ||
          e.surveyorName.toLowerCase().includes(q),
      );
    }
    return list;
  }, [entries, isAdmin, surveyorPrincipal, search]);

  const handleDelete = (id: string) => {
    if (confirm("क्या आप इस प्रविष्टि को हटाना चाहते हैं?")) {
      deleteEntry(id);
      refresh();
      toast.success("प्रविष्टि हटा दी गई");
    }
  };

  const exportCSV = () => {
    const headers = [
      "क्रम संख्या",
      "घर संख्या",
      "वार्ड नंबर",
      "पंचायत",
      "मुखिया",
      "बच्चे का नाम",
      "पिता का नाम",
      "माता का नाम",
      "लिंग",
      "जाति",
      "जन्म तिथि",
      "आयु",
      "कक्षा",
      "विद्यालय",
      "कारण",
      "आधार नंबर",
      "मोबाइल",
      "सर्वे कर्ता",
      "विद्यालय का नाम",
      "सत्र",
      "दिनांक",
    ];
    const rows = filtered.map((e) => [
      e.serialNo,
      e.houseNo,
      e.wardNo,
      e.panchayat,
      e.headName,
      e.childName,
      e.fatherName,
      e.motherName,
      e.gender,
      e.caste,
      e.dob,
      e.age,
      e.studyingClass,
      e.studyingSchool,
      e.notStudyingReason,
      e.aadharNo,
      e.mobileNo,
      e.surveyorName,
      e.schoolName,
      e.session,
      new Date(e.timestamp).toLocaleDateString("hi-IN"),
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `household-survey-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV डाउनलोड हो रहा है...");
  };

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-2 flex-wrap no-print">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="खोजें..."
            className="pl-9 h-11"
            data-ocid="entries.search_input"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={refresh}
          title="ताज़ा करें"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={exportCSV}
          data-ocid="entries.export_csv.button"
          className="gap-2"
        >
          <FileSpreadsheet className="w-4 h-4" />
          CSV
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => window.print()}
          data-ocid="entries.export_pdf.button"
          className="gap-2"
        >
          <Printer className="w-4 h-4" />
          PDF
        </Button>
      </div>

      <div className="flex items-center justify-between no-print">
        <p className="text-sm text-muted-foreground">
          कुल प्रविष्टियाँ: <strong>{filtered.length}</strong>
        </p>
        {isAdmin && <Badge variant="secondary">प्रशासक दृश्य</Badge>}
      </div>

      {/* Print header — always shows current settings school name */}
      <div className="hidden print-only print-header">
        <h1>घरेलू सर्वे रिपोर्ट</h1>
        <p>
          विद्यालय: {settings.schoolName || "—"} | सत्र: {settings.session || "—"}
        </p>
        <p>मुद्रण दिनांक: {new Date().toLocaleDateString("hi-IN")}</p>
      </div>

      {filtered.length === 0 ? (
        <Card data-ocid="entries.empty_state">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Download className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">
              {search ? "कोई परिणाम नहीं मिला" : "अभी तक कोई प्रविष्टि नहीं है"}
            </p>
            {!search && (
              <p className="text-sm text-muted-foreground mt-1">
                सर्वे फॉर्म भरकर पहली प्रविष्टि जोड़ें
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div
            className="space-y-3 md:hidden no-print"
            data-ocid="entries.list"
          >
            {filtered.map((entry, idx) => (
              <Card
                key={entry.id}
                className="entry-card"
                data-ocid={`entries.item.${idx + 1}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {entry.childName}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {entry.fatherName} के पुत्र/पुत्री
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">
                        #{entry.serialNo}
                      </Badge>
                      <button
                        type="button"
                        onClick={() => onEdit(entry)}
                        className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                        data-ocid={`entries.edit_button.${idx + 1}`}
                        title="संपादित करें"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(entry.id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                        data-ocid="entries.delete_button"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-y-1 text-sm">
                    <span className="text-muted-foreground">वार्ड:</span>
                    <span>{entry.wardNo || "—"}</span>
                    <span className="text-muted-foreground">पंचायत:</span>
                    <span>{entry.panchayat || "—"}</span>
                    <span className="text-muted-foreground">कक्षा:</span>
                    <span>{entry.studyingClass || "—"}</span>
                    <span className="text-muted-foreground">लिंग:</span>
                    <span>{entry.gender || "—"}</span>
                    <span className="text-muted-foreground">आयु:</span>
                    <span>{entry.age ? `${entry.age} वर्ष` : "—"}</span>
                    <span className="text-muted-foreground">जाति:</span>
                    <span>{entry.caste || "—"}</span>
                    {isAdmin && (
                      <>
                        <span className="text-muted-foreground">सर्वे कर्ता:</span>
                        <span className="truncate">{entry.surveyorName}</span>
                      </>
                    )}
                  </div>
                  {entry.photo && (
                    <img
                      src={entry.photo}
                      alt="सर्वे फोटो"
                      className="mt-3 w-16 h-16 rounded-md object-cover"
                    />
                  )}
                  {entry.signature && (
                    <img
                      src={entry.signature}
                      alt="signature"
                      className="mt-2 h-10 rounded border"
                    />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div
            className="hidden md:block print:block rounded-lg border overflow-hidden"
            data-ocid="entries.table"
          >
            <Table className="print-table">
              <TableHeader>
                <TableRow className="bg-primary/5">
                  <TableHead>क्रम</TableHead>
                  <TableHead>बच्चे का नाम</TableHead>
                  <TableHead>पिता का नाम</TableHead>
                  <TableHead>लिंग</TableHead>
                  <TableHead>जाति</TableHead>
                  <TableHead>कक्षा</TableHead>
                  <TableHead>वार्ड</TableHead>
                  <TableHead>पंचायत</TableHead>
                  <TableHead>आयु</TableHead>
                  <TableHead>मोबाइल</TableHead>
                  {isAdmin && <TableHead>सर्वे कर्ता</TableHead>}
                  <TableHead>फोटो</TableHead>
                  <TableHead>हस्ताक्षर</TableHead>
                  <TableHead className="no-print">क्रिया</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((entry, idx) => (
                  <TableRow
                    key={entry.id}
                    data-ocid={`entries.row.${idx + 1}`}
                    style={{ breakInside: "avoid" }}
                  >
                    <TableCell>{entry.serialNo}</TableCell>
                    <TableCell className="font-medium">
                      {entry.childName}
                    </TableCell>
                    <TableCell>{entry.fatherName}</TableCell>
                    <TableCell>{entry.gender}</TableCell>
                    <TableCell>{entry.caste}</TableCell>
                    <TableCell>{entry.studyingClass}</TableCell>
                    <TableCell>{entry.wardNo}</TableCell>
                    <TableCell>{entry.panchayat}</TableCell>
                    <TableCell>{entry.age}</TableCell>
                    <TableCell>{entry.mobileNo}</TableCell>
                    {isAdmin && <TableCell>{entry.surveyorName}</TableCell>}
                    <TableCell>
                      {entry.photo ? (
                        <img
                          src={entry.photo}
                          alt="फोटो"
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {entry.signature ? (
                        <img
                          src={entry.signature}
                          alt="हस्ताक्षर"
                          style={{ height: "40px", maxWidth: "100px" }}
                        />
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="no-print">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEdit(entry)}
                          className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                          data-ocid={`entries.edit_button.${idx + 1}`}
                          title="संपादित करें"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(entry.id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                          data-ocid="entries.delete_button"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
