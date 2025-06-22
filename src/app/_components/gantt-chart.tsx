"use client";

import React, { useEffect, useState } from "react";

export interface GanttChartSection {
  start: number;
  end: number;
  name: string;
  color: string;
  header?: boolean;
}

interface GanttChartProps {
  sections: GanttChartSection[];
  progressBar?: number;
}

interface GanttChartRow {
  sections: GanttChartSection[];
  end: number;
}

export const GanttChart = (props: GanttChartProps) => {
  const [rows, setRows] = useState<GanttChartRow[]>([]);
  const [gspan, setGSpan] = useState<number>(0);
  useEffect(() => {
    let strictIgnore = false;

    const buildRows = async () => {
      // Ignore the UseStrict double mount
      await new Promise((resolve) => setTimeout(resolve, 0));
      if (strictIgnore) {
        return;
      }

      const buildingRows: GanttChartRow[] = [];
      const rawSections = props.sections.sort((a, b) => a.start - b.start);
      let globalStart = 999999999;
      let globalEnd = -999999999;

      rawSections.forEach((s) => {
        // For each section, find the lowest row it can fit into
        let lowestValidRowIndex: number | null = null;
        buildingRows.forEach((r, ri) => {
          console.log(
            `Row ${ri} ends at ${r.end}. ${s.name} starts at ${s.start}. Lowest at ${lowestValidRowIndex}`,
          );
          if (
            r.end <= s.start &&
            (lowestValidRowIndex === null || ri < lowestValidRowIndex)
          ) {
            lowestValidRowIndex = ri;
          }
        });

        // If there is no row it fits into, make a new row
        if (lowestValidRowIndex === null) {
          const emptyRow: GanttChartRow = {
            sections: [],
            end: 0,
          };
          buildingRows.push(emptyRow);
          lowestValidRowIndex = buildingRows.length - 1;
          console.log("Making new row ", lowestValidRowIndex, "for", s.name);
        }

        if (s.header) {
          lowestValidRowIndex = 0;
        }

        // Put the section into the row
        const row = buildingRows[lowestValidRowIndex];
        if (!row) {
          throw new Error(
            `Invalid row ${lowestValidRowIndex} / ${buildingRows.length}`,
          );
        }

        // Check the last section before this one. If there is a gap, fill it with a dummy section
        let lastSectionInRow = row.sections[row.sections.length - 1];
        lastSectionInRow ??= { name: "", color: "", end: 0, start: 0 };
        if (lastSectionInRow && s.start - lastSectionInRow.end > 0.0001) {
          const dummySection: GanttChartSection = {
            name: "",
            color: "transparent",
            end: s.start,
            start: lastSectionInRow.end,
          };
          row.sections.push(dummySection);
        }

        const renderedSection: GanttChartSection = {
          name: s.name,
          color: s.color,
          end: s.end,
          start: s.start,
        };

        row.sections.push(renderedSection);
        row.end = s.end;

        globalStart = Math.min(globalStart, s.start);
        globalEnd = Math.max(globalEnd, s.end);
      });

      // Normalize each section so that the everything is between 0 and 1
      const globalSpan = globalEnd - globalStart;
      setGSpan(globalSpan);
      buildingRows.forEach((row) => {
        row.sections.forEach((section) => {
          section.start = (section.start - globalStart) / globalSpan;
          section.end = (section.end - globalStart) / globalSpan;
        });
      });

      setRows(buildingRows);
    };

    void buildRows();

    return () => {
      strictIgnore = true;
    };
  }, [props.sections]);

  console.log(rows);
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        flexWrap: "nowrap",
      }}
    >
      {rows.map((row, rowIndex) => {
        return (
          <div
            key={`row ${rowIndex}`}
            style={{
              height: "2rem",
              width: "100%",
              display: "flex",
              flexDirection: "row",
              flexWrap: "nowrap",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            {row.sections.map((section, sectionIndex) => {
              const progress = (props.progressBar ?? 1) / gspan;
              if (section.start < progress) {
              }
              return (
                <div
                  key={`section ${sectionIndex} ${section.name}`}
                  style={{
                    backgroundColor: section.color,
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    height: "90%",
                    width: `${(section.end - section.start) * 100}%`,
                    marginRight: "2px",
                    marginLeft: "2px",
                    borderRadius: "7px",
                    textAlign: "left",
                    paddingLeft: "10px",
                    textWrap: "nowrap",
                    textOverflow: "ellipsis",
                    fontSize: ".75rem",
                  }}
                >
                  {section.name}
                </div>
              );
            })}
          </div>
        );
      })}
      {props.progressBar !== undefined && (
        <div
          style={{
            position: "relative",
            width: "100%",
          }}
        >
          <div
            style={{
              backgroundColor: "red",
              width: "2px",
              height: `${rows.length * 2}rem`,
              position: "absolute",
              bottom: 0,
              left: `${(props.progressBar / gspan) * 100}%`,
            }}
          />
        </div>
      )}
    </div>
  );
};
