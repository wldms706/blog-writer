import { google, sheets_v4 } from 'googleapis';

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = '시트1';

type UserTrackingData = {
  userId: string;
  email: string;
  planType: string;
  dailyUsage: number;
  totalUsage: number;
  lastAccessDate: string;
  signupDate: string;
  couponUsed: boolean;
  couponCode?: string;
};

async function getGoogleSheetsClient(): Promise<sheets_v4.Sheets | null> {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (!credentials || !SPREADSHEET_ID) {
    console.log('Google Sheets credentials not configured');
    return null;
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(credentials),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return google.sheets({ version: 'v4', auth });
  } catch (error) {
    console.error('Failed to initialize Google Sheets client:', error);
    return null;
  }
}

export async function syncUserToSheet(data: UserTrackingData): Promise<boolean> {
  const sheets = await getGoogleSheetsClient();
  if (!sheets) return false;

  try {
    // 먼저 기존 행 찾기 (이메일로 검색 - B열)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!B:B`,
    });

    const rows = response.data.values || [];
    let rowIndex = -1;

    // 이메일로 기존 행 찾기
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === data.email) {
        rowIndex = i + 1; // 1-indexed
        break;
      }
    }

    // 컬럼 순서: 가입일, 이메일, 플랜, 오늘사용, 총사용, 마지막접속, 쿠폰
    const rowData = [
      data.signupDate,
      data.email,
      data.planType,
      data.dailyUsage,
      data.totalUsage,
      data.lastAccessDate,
      data.couponUsed ? 'Y' : (data.couponCode || ''),
    ];

    if (rowIndex > 0) {
      // 기존 행 업데이트
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A${rowIndex}:G${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [rowData],
        },
      });
    } else {
      // 새 행 추가
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A:G`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [rowData],
        },
      });
    }

    return true;
  } catch (error) {
    console.error('Failed to sync user to Google Sheets:', error);
    return false;
  }
}

export async function initializeSheetHeaders(): Promise<boolean> {
  const sheets = await getGoogleSheetsClient();
  if (!sheets) return false;

  try {
    // 첫 번째 행 확인
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:I1`,
    });

    const headers = response.data.values?.[0];

    // 헤더가 없으면 추가
    if (!headers || headers.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1:I1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[
            'User ID',
            '이메일',
            '가입일',
            '플랜',
            '오늘 사용횟수',
            '총 사용횟수',
            '마지막 접속일',
            '쿠폰 사용',
            '쿠폰 코드',
          ]],
        },
      });
    }

    return true;
  } catch (error) {
    console.error('Failed to initialize sheet headers:', error);
    return false;
  }
}

export async function logUsageEvent(
  userId: string,
  email: string,
  keyword: string,
  businessCategory: string,
): Promise<boolean> {
  const sheets = await getGoogleSheetsClient();
  if (!sheets) return false;

  const usageSheetName = '사용로그';
  const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${usageSheetName}!A:E`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          now,
          userId,
          email,
          keyword,
          businessCategory,
        ]],
      },
    });

    return true;
  } catch (error) {
    console.error('Failed to log usage event:', error);
    return false;
  }
}
