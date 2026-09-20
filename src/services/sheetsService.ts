import { generateTriMasterSchedule } from './scheduleGenerator';
import { INITIAL_BENCHMARKS, INITIAL_LOG_ENTRIES } from '../data/initialData';
import { WorkoutLogEntry } from '../types';

export interface CreateSheetResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
}

export const createTriMasterGoogleSheet = async (
  accessToken: string,
  onProgress?: (msg: string) => void
): Promise<CreateSheetResult> => {
  onProgress?.('Initializing "TriMaster 2027" spreadsheet with 4 structured tabs...');

  // 1. Create Spreadsheet with all 4 tabs and frozen header rows
  const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: 'TriMaster 2027',
      },
      sheets: [
        {
          properties: {
            title: 'Dashboard',
            gridProperties: { frozenRowCount: 1, columnCount: 10, rowCount: 50 },
          },
        },
        {
          properties: {
            title: 'Schedule',
            gridProperties: { frozenRowCount: 1, columnCount: 8, rowCount: 500 },
          },
        },
        {
          properties: {
            title: 'Log',
            gridProperties: { frozenRowCount: 1, columnCount: 8, rowCount: 1000 },
          },
        },
        {
          properties: {
            title: 'Benchmarks',
            gridProperties: { frozenRowCount: 1, columnCount: 8, rowCount: 30 },
          },
        },
      ],
    }),
  });

  if (!createResponse.ok) {
    const err = await createResponse.text();
    throw new Error(`Failed to create Google Sheet: ${err}`);
  }

  const sheetData = await createResponse.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  const sheetMap: { [title: string]: number } = {};
  sheetData.sheets.forEach((s: any) => {
    sheetMap[s.properties.title] = s.properties.sheetId;
  });

  // 2. Generate Schedule data through Dec 31, 2027
  onProgress?.('Generating daily schedule through Dec 31, 2027 (468+ days)...');
  const fullSchedule = generateTriMasterSchedule();

  const scheduleRows = fullSchedule.map((d) => [
    d.date,
    d.dayOfWeek,
    d.sessionType,
    d.focus,
    d.phase,
    d.volumeMinutes,
    d.volumeFlag,
  ]);

  // 3. Prepare Benchmarks Data
  const benchmarkRows = [
    [
      'Discipline',
      'Current Metric',
      '1:10 Target Metric',
      'Gap',
      'Weekly Improvement Rate Needed',
      'Strategic Action Plan',
    ],
    [
      'Swim (750m)',
      '00:23:00',
      '00:22:00',
      '=C2-B2',
      '=IF(Dashboard!$B$3>0, TEXT((B2-C2)/(Dashboard!$B$3/7), "[ss].00") & " sec/wk", "0.9 sec/wk")',
      'Maintenance only; preserve aerobic engine, practice open-water drafting.',
    ],
    [
      'Transition 1 (T1)',
      '00:01:30',
      '00:01:30',
      '=C3-B3',
      '0.00 sec/wk',
      'Helmet on first, fast running mount with pre-clipped shoes.',
    ],
    [
      'Bike (20km)',
      '00:52:00',
      '00:39:00',
      '=C4-B4',
      '=IF(Dashboard!$B$3>0, TEXT((B4-C4)/(Dashboard!$B$3/7), "[ss].00") & " sec/wk", "11.8 sec/wk")',
      'PRIMARY BOTTLENECK. 17kg MTB causes massive drag (23 km/h). Transition to road/aero bars; high-power intervals.',
    ],
    [
      'Transition 2 (T2)',
      '00:01:30',
      '00:01:30',
      '=C5-B5',
      '0.00 sec/wk',
      'Quick rack, elastic speed laces, instant cadence pickup.',
    ],
    [
      'Run (5km)',
      '00:28:00',
      '00:26:00',
      '=C6-B6',
      '=IF(Dashboard!$B$3>0, TEXT((B6-C6)/(Dashboard!$B$3/7), "[ss].00") & " sec/wk", "1.8 sec/wk")',
      'Target 5:12/km off bike (from 5:36/km). Trained via Friday brick sessions and Tuesday tempo runs.',
    ],
    [
      'Total Finish Time',
      '=SUM(B2:B6)',
      '=SUM(C2:C6)',
      '=C7-B7',
      '=IF(Dashboard!$B$3>0, TEXT((B7-C7)/(Dashboard!$B$3/7), "[ss].00") & " sec/wk", "32.7 sec/wk")',
      'Targeting Sub-1:10:00 finish by Dec 31, 2027 (~66 weeks remaining).',
    ],
  ];

  // 4. Prepare Dashboard Tab Data
  const dashboardRows = [
    ['Metric', 'Value', 'Status / Target Formula', 'Notes'],
    ['Target Race Time', '01:10:00', 'Goal: Sub-1:10:00', 'Sprint Triathlon (750m / 20km / 5km)'],
    ['Current Baseline Time', '=Benchmarks!B7', 'Initial Estimate: 01:46:00', 'Swim 23:00 + T1 1:30 + Bike 52:00 + T2 1:30 + Run 28:00'],
    [
      'Projected Finish Time (Rolling 4-Wk)',
      '=IFERROR(AVERAGEIFS(Log!D:D, Log!B:B, "Swim", Log!A:A, ">="&TODAY()-28, Log!A:A, "<="&TODAY()), Benchmarks!B2) + IFERROR(AVERAGEIFS(Log!D:D, Log!B:B, "Bike", Log!A:A, ">="&TODAY()-28, Log!A:A, "<="&TODAY()), Benchmarks!B4) + IFERROR(AVERAGEIFS(Log!D:D, Log!B:B, "Run", Log!A:A, ">="&TODAY()-28, Log!A:A, "<="&TODAY()), Benchmarks!B6) + TIME(0,3,0)',
      '=IF(B4<=TIME(1,10,0), "TARGET ACHIEVED (Sub-1:10)", "IN PROGRESS (Gap: " & TEXT(B4-TIME(1,10,0), "[mm]:ss") & ")")',
      'Calculated from 4-week rolling avg of logged splits + 3 min transition allowance',
    ],
    ['Days Remaining to Dec 31 2027', '=DATE(2027,12,31)-TODAY()', 'Live formula using TODAY()', 'Countdown to race day'],
    ['Weeks Remaining', '=ROUNDDOWN(B5/7, 0)', 'Training cycles available', '5-week periodization cycles'],
    ['Total Finish Gap to Close', '=B4-B2', 'Required Improvement', 'Current projection vs 1:10:00 target'],
    ['Sub-1:10 Progress Visual', '=SPARKLINE(MIN(1, TIME(1,10,0)/B4), {"charttype", "bar"; "max", 1; "color1", IF(B4<=TIME(1,10,0), "#198754", "#0D6EFD")})', 'Visual Completion Bar', 'Bar turns green when Sub-1:10 is achieved'],
    ['Transition Allowance (T1 + T2)', '00:03:00', '3 min fixed', 'T1 (1:30) + T2 (1:30)'],
    ['Logged Workouts (Last 28 Days)', '=COUNTIFS(Log!A:A, ">="&TODAY()-28, Log!A:A, "<="&TODAY())', 'Active consistency count', 'Rolling 4-week sample pool size'],
    ['', '', '', ''],
    ['DISCIPLINE BREAKDOWN', 'CURRENT 4-WK ROLLING SPLIT', '1:10 TARGET SPLIT', 'GAP & STATUS'],
    [
      'Swim (750m)',
      '=IFERROR(AVERAGEIFS(Log!D:D, Log!B:B, "Swim", Log!A:A, ">="&TODAY()-28, Log!A:A, "<="&TODAY()), Benchmarks!B2)',
      '00:22:00',
      '=IF(B13<=C13, "On Track (Maintenance)", "Needs Attention: " & TEXT(B13-C13, "[mm]:ss"))',
    ],
    [
      'Bike (20km)',
      '=IFERROR(AVERAGEIFS(Log!D:D, Log!B:B, "Bike", Log!A:A, ">="&TODAY()-28, Log!A:A, "<="&TODAY()), Benchmarks!B4)',
      '00:39:00',
      '=IF(B14<=C14, "On Track", "PRIMARY BOTTLENECK: " & TEXT(B14-C14, "[mm]:ss") & " gap")',
    ],
    [
      'Run (5km)',
      '=IFERROR(AVERAGEIFS(Log!D:D, Log!B:B, "Run", Log!A:A, ">="&TODAY()-28, Log!A:A, "<="&TODAY()), Benchmarks!B6)',
      '00:26:00',
      '=IF(B15<=C15, "On Track", "Gap: " & TEXT(B15-C15, "[mm]:ss"))',
    ],
    ['Transitions (T1+T2)', '00:03:00', '00:03:00', 'Locked standard'],
    ['Total Projected', '=SUM(B13:B16)', '=B2', '=IF(B17<=C17, "SUB-1:10 READY!", "Training in progress")'],
  ];

  // 5. Prepare Log Tab Data
  const logRows = [
    ['Date', 'Session Type', 'Distance', 'Duration', 'Pace or Speed', 'RPE (1-10)', 'Notes'],
    ...INITIAL_LOG_ENTRIES.map((log) => [
      log.date,
      log.sessionType,
      log.distance,
      log.duration,
      log.paceOrSpeed,
      log.rpe,
      log.notes,
    ]),
  ];

  // Batch insert values into all tabs
  onProgress?.('Writing live formulas and training logs to all 4 tabs...');
  const valueResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: [
          {
            range: 'Dashboard!A1:D20',
            values: dashboardRows,
          },
          {
            range: `Schedule!A1:G${scheduleRows.length + 1}`,
            values: [
              ['Date', 'Day', 'Session Type', 'Focus', 'Phase', 'Est. Volume (min)', 'Volume Progression Flag'],
              ...scheduleRows,
            ],
          },
          {
            range: `Log!A1:G${logRows.length}`,
            values: logRows,
          },
          {
            range: `Benchmarks!A1:F${benchmarkRows.length}`,
            values: benchmarkRows,
          },
        ],
      }),
    }
  );

  if (!valueResponse.ok) {
    const err = await valueResponse.text();
    console.error('Value write error:', err);
  }

  // 6. Apply Formatting, Data Validation, and Conditional Rules
  onProgress?.('Applying styling, frozen headers, data validation & conditional formatting...');

  const requests: any[] = [];

  // Header format for all 4 sheets: Bold, Dark Blue background (#1B365D), White text (#FFFFFF)
  Object.values(sheetMap).forEach((sheetId) => {
    requests.push({
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: 0,
          endRowIndex: 1,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.106, green: 0.212, blue: 0.365 }, // Dark blue #1B365D
            textFormat: {
              foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 },
              bold: true,
              fontSize: 11,
            },
            horizontalAlignment: 'CENTER',
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
      },
    });
  });

  // Secondary sub-header for Dashboard row 12
  requests.push({
    repeatCell: {
      range: {
        sheetId: sheetMap['Dashboard'],
        startRowIndex: 11,
        endRowIndex: 12,
        startColumnIndex: 0,
        endColumnIndex: 4,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red: 0.18, green: 0.31, blue: 0.48 },
          textFormat: {
            foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 },
            bold: true,
            fontSize: 10,
          },
          horizontalAlignment: 'CENTER',
        },
      },
      fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
    },
  });

  // Data Validation on Log Tab (Column B: Session Type dropdown: Swim, Bike, Run, Rest, Brick)
  requests.push({
    setDataValidation: {
      range: {
        sheetId: sheetMap['Log'],
        startRowIndex: 1,
        endRowIndex: 1000,
        startColumnIndex: 1,
        endColumnIndex: 2,
      },
      rule: {
        condition: {
          type: 'ONE_OF_LIST',
          values: [
            { userEnteredValue: 'Swim' },
            { userEnteredValue: 'Bike' },
            { userEnteredValue: 'Run' },
            { userEnteredValue: 'Rest' },
            { userEnteredValue: 'Brick' },
          ],
        },
        inputMessage: 'Select session discipline',
        showCustomUi: true,
        strict: false,
      },
    },
  });

  // Conditional Formatting Rules:
  // 1. Dashboard: Projected Finish Time turns light green when <= 1:10:00
  requests.push({
    addConditionalFormatRule: {
      rule: {
        ranges: [
          {
            sheetId: sheetMap['Dashboard'],
            startRowIndex: 3,
            endRowIndex: 4,
            startColumnIndex: 1,
            endColumnIndex: 2,
          },
        ],
        booleanRule: {
          condition: {
            type: 'CUSTOM_FORMULA',
            values: [{ userEnteredValue: '=$B$4<=TIME(1,10,0)' }],
          },
          format: {
            backgroundColor: { red: 0.82, green: 0.94, blue: 0.85 }, // Light Green
            textFormat: {
              foregroundColor: { red: 0.06, green: 0.45, blue: 0.18 },
              bold: true,
            },
          },
        },
      },
      index: 0,
    },
  });

  // 2. Schedule tab conditional formatting:
  // - Mondays highlighted light red: =$B2="Monday"
  requests.push({
    addConditionalFormatRule: {
      rule: {
        ranges: [
          {
            sheetId: sheetMap['Schedule'],
            startRowIndex: 1,
            endRowIndex: 500,
            startColumnIndex: 0,
            endColumnIndex: 7,
          },
        ],
        booleanRule: {
          condition: {
            type: 'CUSTOM_FORMULA',
            values: [{ userEnteredValue: '=$B2="Monday"' }],
          },
          format: {
            backgroundColor: { red: 0.99, green: 0.91, blue: 0.91 }, // Light Red
          },
        },
      },
      index: 0,
    },
  });

  // - Swim days light blue
  requests.push({
    addConditionalFormatRule: {
      rule: {
        ranges: [
          {
            sheetId: sheetMap['Schedule'],
            startRowIndex: 1,
            endRowIndex: 500,
            startColumnIndex: 0,
            endColumnIndex: 7,
          },
        ],
        booleanRule: {
          condition: {
            type: 'CUSTOM_FORMULA',
            values: [{ userEnteredValue: '=AND($B2<>"Monday", ISNUMBER(SEARCH("Swim", $C2)))' }],
          },
          format: {
            backgroundColor: { red: 0.91, green: 0.94, blue: 0.99 }, // Light Blue
          },
        },
      },
      index: 1,
    },
  });

  // - Bike days light green
  requests.push({
    addConditionalFormatRule: {
      rule: {
        ranges: [
          {
            sheetId: sheetMap['Schedule'],
            startRowIndex: 1,
            endRowIndex: 500,
            startColumnIndex: 0,
            endColumnIndex: 7,
          },
        ],
        booleanRule: {
          condition: {
            type: 'CUSTOM_FORMULA',
            values: [{ userEnteredValue: '=ISNUMBER(SEARCH("Bike", $C2))' }],
          },
          format: {
            backgroundColor: { red: 0.90, green: 0.96, blue: 0.92 }, // Light Green
          },
        },
      },
      index: 2,
    },
  });

  // - Run days light yellow
  requests.push({
    addConditionalFormatRule: {
      rule: {
        ranges: [
          {
            sheetId: sheetMap['Schedule'],
            startRowIndex: 1,
            endRowIndex: 500,
            startColumnIndex: 0,
            endColumnIndex: 7,
          },
        ],
        booleanRule: {
          condition: {
            type: 'CUSTOM_FORMULA',
            values: [{ userEnteredValue: '=ISNUMBER(SEARCH("Run", $C2))' }],
          },
          format: {
            backgroundColor: { red: 1.0, green: 0.98, blue: 0.88 }, // Light Yellow
          },
        },
      },
      index: 3,
    },
  });

  // 3. Log tab conditional formatting: rows with RPE above 9 turn red as overtraining warning
  requests.push({
    addConditionalFormatRule: {
      rule: {
        ranges: [
          {
            sheetId: sheetMap['Log'],
            startRowIndex: 1,
            endRowIndex: 1000,
            startColumnIndex: 0,
            endColumnIndex: 7,
          },
        ],
        booleanRule: {
          condition: {
            type: 'CUSTOM_FORMULA',
            values: [{ userEnteredValue: '=$F2>9' }],
          },
          format: {
            backgroundColor: { red: 0.99, green: 0.85, blue: 0.85 }, // Soft alert red
            textFormat: {
              foregroundColor: { red: 0.70, green: 0.05, blue: 0.05 },
              bold: true,
            },
          },
        },
      },
      index: 0,
    },
  });

  // Column widths formatting for polished layout
  // Schedule column widths: Date (100), Day (100), Session Type (120), Focus (380), Phase (140), Vol (90), Flag (150)
  const scheduleColWidths = [105, 100, 130, 420, 150, 100, 160];
  scheduleColWidths.forEach((width, colIdx) => {
    requests.push({
      updateDimensionProperties: {
        range: {
          sheetId: sheetMap['Schedule'],
          dimension: 'COLUMNS',
          startIndex: colIdx,
          endIndex: colIdx + 1,
        },
        properties: { pixelSize: width },
        fields: 'pixelSize',
      },
    });
  });

  // Dashboard column widths
  const dashboardColWidths = [240, 180, 260, 320];
  dashboardColWidths.forEach((width, colIdx) => {
    requests.push({
      updateDimensionProperties: {
        range: {
          sheetId: sheetMap['Dashboard'],
          dimension: 'COLUMNS',
          startIndex: colIdx,
          endIndex: colIdx + 1,
        },
        properties: { pixelSize: width },
        fields: 'pixelSize',
      },
    });
  });

  // Log column widths: Date, Session Type, Distance, Duration, Pace, RPE, Notes
  const logColWidths = [110, 120, 100, 100, 120, 95, 360];
  logColWidths.forEach((width, colIdx) => {
    requests.push({
      updateDimensionProperties: {
        range: {
          sheetId: sheetMap['Log'],
          dimension: 'COLUMNS',
          startIndex: colIdx,
          endIndex: colIdx + 1,
        },
        properties: { pixelSize: width },
        fields: 'pixelSize',
      },
    });
  });

  // Benchmarks column widths
  const benchmarkColWidths = [170, 120, 130, 110, 160, 380];
  benchmarkColWidths.forEach((width, colIdx) => {
    requests.push({
      updateDimensionProperties: {
        range: {
          sheetId: sheetMap['Benchmarks'],
          dimension: 'COLUMNS',
          startIndex: colIdx,
          endIndex: colIdx + 1,
        },
        properties: { pixelSize: width },
        fields: 'pixelSize',
      },
    });
  });

  // Execute batch update requests
  const formatResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    }
  );

  if (!formatResponse.ok) {
    const err = await formatResponse.text();
    console.warn('Batch format warnings:', err);
  }

  onProgress?.('TriMaster 2027 Google Sheet successfully created and formatted!');

  return {
    spreadsheetId,
    spreadsheetUrl,
    title: 'TriMaster 2027',
  };
};

// Append a workout log directly to the Log tab of the Google Sheet
export const appendWorkoutLogToGoogleSheet = async (
  accessToken: string,
  spreadsheetId: string,
  log: WorkoutLogEntry
) => {
  const range = 'Log!A:G';
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [
          [
            log.date,
            log.sessionType,
            log.distance,
            log.duration,
            log.paceOrSpeed,
            log.rpe,
            log.notes,
          ],
        ],
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to append log to Google Sheet: ${err}`);
  }

  return await response.json();
};
