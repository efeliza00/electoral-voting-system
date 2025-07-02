import { Candidate, ElectionDocument, Position } from "@/app/models/Election";
import { format } from "date-fns";
import * as XLSX from "xlsx";

type ElectionInfo = Omit<ElectionDocument, "voters" | "positions"> & {
    totalVoters: number
    votedCount: number
    turnoutPercentage: number
    clusterTurnoutPercentage: number
    positions: (Omit<Position, "candidates" | "winners"> & {
        totalVotes: number
        candidates: (Candidate & {
            votes: number
            votePercentage: number
        })[]
        winners: (Candidate & {
            votes: number
            votePercentage: number
        })[]
    })[]
}

const spacerRow = (columns: number = 1): string[] => {
  return Array(columns).fill("");
};

export const generateElectionResultsToSpreadSheet = (
  election: ElectionInfo
): void => { 
  const sheetData: (string | number)[][] = [];

  sheetData.push(["ELECTION RESULTS", ""]);
  sheetData.push(["ELECTION NAME:", election.name.toLocaleUpperCase()]);
  sheetData.push(["STATUS:", election.status.toLocaleUpperCase()]);
  sheetData.push([
    "START DATE:",
    format(election.startDate, "MMM d, yyyy 'at' hh:mm aaa"),
  ]);
  sheetData.push([
    "END DATE:",
    format(election.startDate, "MMM d, yyyy 'at' hh:mm aaa"),
  ]);
  sheetData.push(["TOTAL VOTERS:", election.totalVoters]);
  sheetData.push(["VOTED COUNTED:", election.votedCount]);
  sheetData.push(["TURNOUT PERCENTAGE:", `${election.turnoutPercentage}%`]);
  sheetData.push(["CLUSTER TURNOUT:", `${election.clusterTurnoutPercentage}%`]);
  sheetData.push(spacerRow());

  election.positions.forEach((position) => {
    sheetData.push([`POSITON: ${position.title}`, ""]);
    sheetData.push(spacerRow());

    sheetData.push(["CANDIDATE", "VOTES", "VOTE BY PERCENTAGE"]);

    position.candidates.forEach((candidate) => {
      sheetData.push([
        candidate.name.toLocaleUpperCase(),
        candidate.votes,
        `${candidate.votePercentage}%`,
      ]);
    });

    sheetData.push(spacerRow()); 
  });

   const ws = XLSX.utils.aoa_to_sheet(sheetData);
 const colWidths = sheetData[0].map((_, colIndex) => {
    const maxLength = Math.max(
      ...sheetData.map(row => 
        row[colIndex] ? String(row[colIndex]).length : 0
      )
    );
    return { wch: Math.min(maxLength, 50) };
  });
  ws["!cols"] = colWidths;
   const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Election Results");
  XLSX.writeFile(wb, `${election.name.replace(/\s+/g, "_")}_Results.xlsx`);

};