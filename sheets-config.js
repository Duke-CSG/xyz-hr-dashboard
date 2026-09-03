// ============================================================
// 구글 시트 연동 설정
// ============================================================
// 사용법:
// 1. 구글 시트에서 [파일] → [공유] → [웹에 게시] → 각 시트를 CSV로 게시
// 2. 게시된 CSV URL을 아래에 붙여넣기
// 3. USE_GOOGLE_SHEETS 를 true 로 변경
//
// URL이 비어있거나 USE_GOOGLE_SHEETS=false 이면
// data.js의 내장 데이터를 사용합니다 (안전 장치).
// ============================================================

const USE_GOOGLE_SHEETS = false;  // ← 시트 연동 시 true로 변경

const SHEET_URLS = {
  // 인력현황 (재직자 명단) CSV 게시 주소
  people: "",
  // 조직도 CSV 게시 주소
  orgchart: "",
  // 채용요청 CSV 게시 주소
  recruitReqs: "",
  // 전형진행 CSV 게시 주소
  recruitFunnel: ""
};

// CSV 파싱 (간단 버전 - 쉼표 구분, 따옴표 처리)
function parseCSV(text){
  const rows=[]; let row=[],cur='',inQ=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(inQ){ if(c==='"'&&text[i+1]==='"'){cur+='"';i++;} else if(c==='"'){inQ=false;} else cur+=c; }
    else { if(c==='"')inQ=true; else if(c===','){row.push(cur);cur='';} else if(c==='\n'||c==='\r'){ if(cur||row.length){row.push(cur);rows.push(row);row=[];cur='';} if(c==='\r'&&text[i+1]==='\n')i++; } else cur+=c; }
  }
  if(cur||row.length){row.push(cur);rows.push(row);}
  return rows;
}
async function fetchSheet(url){
  if(!url) return null;
  try{ const res=await fetch(url); const text=await res.text(); return parseCSV(text); }
  catch(e){ console.warn('시트 로드 실패, 내장 데이터 사용:',e); return null; }
}
