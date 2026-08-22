const SITE_PASSWORD = "9000";
const UNLOCK_KEY = "fishing-calendar-unlocked";
const passwordGate = document.getElementById("password-gate");
const appMain = document.querySelector(".app");

function unlockApp() {
  passwordGate.hidden = true;
  appMain.hidden = false;
}

if (localStorage.getItem(UNLOCK_KEY) === "true") {
  unlockApp();
}

document.getElementById("password-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.getElementById("password-input");
  const errorEl = document.getElementById("password-error");
  if (input.value === SITE_PASSWORD) {
    localStorage.setItem(UNLOCK_KEY, "true");
    errorEl.textContent = "";
    unlockApp();
  } else {
    errorEl.textContent = "비밀번호가 올바르지 않습니다";
    input.value = "";
    input.focus();
  }
});

const SUPABASE_URL = "https://exrofehzsootidpmemrn.supabase.co";
const SUPABASE_KEY = "sb_publishable_luB78LH___zEM55Quc8iFA_OBQGwsiS";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const status = document.getElementById("status");

function setStatus(message) {
  status.textContent = message || "";
}

function localDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function dateRangeStrings(startStr, endStr) {
  const dates = [];
  const cur = new Date(startStr + "T00:00:00");
  const end = new Date(endStr + "T00:00:00");
  while (cur <= end) {
    dates.push(localDateString(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function buildGridDates(viewDate) {
  const first = startOfMonth(viewDate);
  const last = endOfMonth(viewDate);
  const gridStart = new Date(first);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());
  const gridEnd = new Date(last);
  gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));

  const dates = [];
  const cur = new Date(gridStart);
  while (cur <= gridEnd) {
    dates.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

const HOLIDAYS = {
  "2025-01-01": "신정",
  "2025-01-28": "설날 연휴",
  "2025-01-29": "설날",
  "2025-01-30": "설날 연휴",
  "2025-03-01": "삼일절",
  "2025-03-03": "대체공휴일",
  "2025-05-05": "어린이날·부처님오신날",
  "2025-05-06": "대체공휴일",
  "2025-06-03": "선거일",
  "2025-06-06": "현충일",
  "2025-08-15": "광복절",
  "2025-10-03": "개천절",
  "2025-10-05": "추석 연휴",
  "2025-10-06": "추석",
  "2025-10-07": "추석 연휴",
  "2025-10-08": "대체공휴일",
  "2025-10-09": "한글날",
  "2025-12-25": "크리스마스",
  "2026-01-01": "신정",
  "2026-02-16": "설날 연휴",
  "2026-02-17": "설날",
  "2026-02-18": "설날 연휴",
  "2026-03-01": "삼일절",
  "2026-03-02": "대체공휴일",
  "2026-05-05": "어린이날",
  "2026-05-24": "부처님오신날",
  "2026-05-25": "대체공휴일",
  "2026-06-03": "선거일",
  "2026-06-06": "현충일",
  "2026-08-15": "광복절",
  "2026-08-17": "대체공휴일",
  "2026-09-24": "추석 연휴",
  "2026-09-25": "추석",
  "2026-09-26": "추석 연휴",
  "2026-10-03": "개천절",
  "2026-10-05": "대체공휴일",
  "2026-10-09": "한글날",
  "2026-12-25": "크리스마스",
  "2027-01-01": "신정",
  "2027-02-07": "설날",
  "2027-02-08": "설날 연휴",
  "2027-02-09": "대체공휴일",
  "2027-03-01": "삼일절",
  "2027-05-05": "어린이날",
  "2027-05-13": "부처님오신날",
  "2027-06-06": "현충일",
  "2027-08-15": "광복절",
  "2027-08-16": "대체공휴일",
  "2027-09-14": "추석 연휴",
  "2027-09-15": "추석",
  "2027-09-16": "추석 연휴",
  "2027-10-03": "개천절",
  "2027-10-04": "대체공휴일",
  "2027-10-09": "한글날",
  "2027-10-11": "대체공휴일",
  "2027-12-25": "크리스마스",
  "2027-12-27": "대체공휴일",
};

const MEMBER_COLORS = ["#d97757", "#6b8caf", "#7c9885", "#b47bc4", "#c4a24a", "#d9737a", "#82a0d8", "#8fbf7f"];

function colorForMember(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return MEMBER_COLORS[hash % MEMBER_COLORS.length];
}

let viewDate = startOfMonth(new Date());
let selectedDate = new Date();
let monthEvents = [];
const knownMembers = new Set();

let rangePicking = false;
let pendingRangeStart = null;
let pendingRangeEnd = null;

const rangeBtn = document.getElementById("range-btn");
const rangeDisplay = document.getElementById("range-display");

function updateRangeDisplay() {
  if (pendingRangeStart && pendingRangeEnd) {
    rangeDisplay.textContent = `${formatShortDate(localDateString(pendingRangeStart))}~${formatShortDate(localDateString(pendingRangeEnd))}`;
  } else if (pendingRangeStart) {
    rangeDisplay.textContent = `${formatShortDate(localDateString(pendingRangeStart))}~`;
  } else {
    rangeDisplay.textContent = "";
  }
}

function resetRangePicking() {
  rangePicking = false;
  pendingRangeStart = null;
  pendingRangeEnd = null;
  rangeBtn.textContent = "기간";
  rangeBtn.classList.remove("active");
  updateRangeDisplay();
}

rangeBtn.addEventListener("click", () => {
  rangePicking = true;
  pendingRangeStart = selectedDate;
  pendingRangeEnd = null;
  rangeBtn.textContent = "종료일 선택";
  rangeBtn.classList.add("active");
  updateRangeDisplay();
  renderCalendar();
});

function handleRangeClick(date) {
  if (date < pendingRangeStart) {
    resetRangePicking();
    selectDate(date);
    return;
  }
  pendingRangeEnd = date;
  rangePicking = false;
  rangeBtn.textContent = "기간";
  rangeBtn.classList.remove("active");
  updateRangeDisplay();
  selectDate(pendingRangeStart);
  renderCalendar();
}

function handleDayClick(date) {
  if (rangePicking) {
    handleRangeClick(date);
  } else {
    if (pendingRangeStart) {
      resetRangePicking();
    }
    selectDate(date);
  }
}

function renderCalendar() {
  const dates = buildGridDates(viewDate);
  const todayStr = localDateString(new Date());
  const selectedStr = localDateString(selectedDate);

  document.getElementById("current-month").textContent = viewDate.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
  });

  const grid = document.getElementById("calendar-grid");
  grid.innerHTML = "";

  for (let w = 0; w < dates.length / 7; w++) {
    const weekDates = dates.slice(w * 7, w * 7 + 7);
    const weekRow = document.createElement("div");
    weekRow.className = "week-row";

    weekDates.forEach((date, i) => {
      const dStr = localDateString(date);
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "calendar-cell";
      cell.style.gridColumn = String(i + 1);
      cell.style.gridRow = "1";
      if (date.getMonth() !== viewDate.getMonth()) cell.classList.add("outside");
      if (dStr === todayStr) cell.classList.add("today");
      if (dStr === selectedStr) cell.classList.add("selected");
      if (pendingRangeStart) {
        const startStr = localDateString(pendingRangeStart);
        const endStr = pendingRangeEnd ? localDateString(pendingRangeEnd) : startStr;
        if (dStr >= startStr && dStr <= endStr) cell.classList.add("in-range");
        if (dStr === startStr) cell.classList.add("range-start");
        if (pendingRangeEnd && dStr === endStr) cell.classList.add("range-end");
      }
      const holidayName = HOLIDAYS[dStr];
      if (holidayName) {
        cell.classList.add("holiday");
        cell.title = holidayName;
      }

      const num = document.createElement("span");
      num.className = "cell-date";
      num.textContent = date.getDate();
      cell.appendChild(num);

      if (holidayName) {
        const label = document.createElement("span");
        label.className = "holiday-label";
        label.textContent = holidayName;
        cell.appendChild(label);
      }

      cell.addEventListener("click", () => handleDayClick(date));
      weekRow.appendChild(cell);
    });

    const weekStartStr = localDateString(weekDates[0]);
    const weekEndStr = localDateString(weekDates[6]);
    const segments = [];
    monthEvents.forEach((ev) => {
      const evEnd = ev.end_date || ev.event_date;
      const segStart = ev.event_date > weekStartStr ? ev.event_date : weekStartStr;
      const segEnd = evEnd < weekEndStr ? evEnd : weekEndStr;
      if (segStart > segEnd) return;
      const startIdx = weekDates.findIndex((d) => localDateString(d) === segStart);
      const endIdx = weekDates.findIndex((d) => localDateString(d) === segEnd);
      segments.push({
        ev,
        startCol: startIdx + 1,
        endCol: endIdx + 2,
        segStartDate: weekDates[startIdx],
        isTrueStart: segStart === ev.event_date,
        isTrueEnd: segEnd === evEnd,
      });
    });

    segments.sort((a, b) => a.startCol - b.startCol || a.endCol - b.endCol);
    const laneEnds = [];
    segments.forEach((seg) => {
      let lane = laneEnds.findIndex((endCol) => endCol <= seg.startCol);
      if (lane === -1) lane = laneEnds.length;
      laneEnds[lane] = seg.endCol;
      seg.lane = lane;
    });

    segments.forEach((seg) => {
      const bar = document.createElement("div");
      bar.className = "event-bar";
      if (seg.isTrueStart) bar.classList.add("seg-start");
      if (seg.isTrueEnd) bar.classList.add("seg-end");
      bar.style.gridColumn = `${seg.startCol} / ${seg.endCol}`;
      bar.style.gridRow = String(2 + seg.lane);
      bar.style.background = colorForMember(seg.ev.member);
      const shortTitle = seg.ev.title.split("/")[0].trim();
      bar.textContent = shortTitle;
      bar.title = `${seg.ev.title} / ${seg.ev.member}`;
      bar.addEventListener("click", () => handleDayClick(seg.segStartDate));
      weekRow.appendChild(bar);
    });

    grid.appendChild(weekRow);
  }
}

function renderAgendaForSelected() {
  const dStr = localDateString(selectedDate);
  const dayEvents = monthEvents.filter((ev) => {
    const end = ev.end_date || ev.event_date;
    return ev.event_date <= dStr && dStr <= end;
  });
  renderAgenda(dayEvents);
}

function formatShortDate(dateStr) {
  const [, m, d] = dateStr.split("-");
  return `${Number(m)}/${Number(d)}`;
}

function startEditingEvent(li, ev) {
  const span = li.querySelector(".event-title");
  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.className = "event-edit-input";
  editInput.value = ev.title;
  span.parentNode.replaceChild(editInput, span);
  editInput.focus();
  editInput.select();

  let settled = false;
  const finish = (save) => {
    if (settled) return;
    settled = true;
    const newTitle = editInput.value.trim();
    if (save && newTitle && newTitle !== ev.title) {
      updateEventTitle(ev.id, newTitle);
    } else {
      renderAgendaForSelected();
    }
  };

  editInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      finish(true);
    } else if (event.key === "Escape") {
      event.preventDefault();
      finish(false);
    }
  });
  editInput.addEventListener("blur", () => finish(true));
}

function renderAgenda(events) {
  const dateLabel = selectedDate.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });
  const holidayName = HOLIDAYS[localDateString(selectedDate)];
  document.getElementById("selected-date-label").textContent = holidayName
    ? `${dateLabel} · ${holidayName}`
    : dateLabel;

  const list = document.getElementById("agenda-list");
  list.innerHTML = "";

  const sorted = [...events].sort((a, b) => (a.event_time || "99:99").localeCompare(b.event_time || "99:99"));

  sorted.forEach((ev) => {
    const li = document.createElement("li");
    li.className = "agenda-item";

    const row = document.createElement("div");
    row.className = "agenda-row";

    const badge = document.createElement("span");
    badge.className = "member-badge";
    badge.textContent = ev.member;
    badge.style.background = colorForMember(ev.member);
    row.appendChild(badge);

    const span = document.createElement("span");
    span.className = "event-title";
    span.textContent = ev.title;
    span.addEventListener("dblclick", () => startEditingEvent(li, ev));
    row.appendChild(span);

    if (ev.end_date && ev.end_date !== ev.event_date) {
      const range = document.createElement("span");
      range.className = "event-range";
      range.textContent = `${formatShortDate(ev.event_date)}~${formatShortDate(ev.end_date)}`;
      row.appendChild(range);
    }

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.textContent = "✕";
    deleteBtn.addEventListener("click", () => {
      if (confirm("일정을 삭제하시겠습니까?")) {
        deleteEvent(ev.id);
      }
    });
    row.appendChild(deleteBtn);

    li.appendChild(row);

    if (ev.event_time) {
      const time = document.createElement("div");
      time.className = "event-time";
      time.textContent = ev.event_time;
      li.appendChild(time);
    }

    list.appendChild(li);
  });

  if (sorted.length === 0) {
    const empty = document.createElement("li");
    empty.className = "agenda-empty";
    empty.textContent = "일정이 없습니다";
    list.appendChild(empty);
  }
}

function updateMemberList(events) {
  events.forEach((ev) => knownMembers.add(ev.member));
  const datalist = document.getElementById("member-list");
  datalist.innerHTML = "";
  [...knownMembers].sort().forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    datalist.appendChild(option);
  });
}

async function loadMonth() {
  setStatus("불러오는 중...");
  const first = startOfMonth(viewDate);
  const last = endOfMonth(viewDate);

  const { data, error } = await supabaseClient
    .from("fishing_events")
    .select("*")
    .lte("event_date", localDateString(last))
    .gte("end_date", localDateString(first))
    .order("event_date", { ascending: true })
    .order("event_time", { ascending: true });

  if (error) {
    setStatus("불러오기 실패: " + error.message);
    monthEvents = [];
    renderCalendar();
    renderAgendaForSelected();
    return;
  }

  setStatus("");
  monthEvents = data;
  renderCalendar();
  updateMemberList(monthEvents);
  renderAgendaForSelected();
}

function selectDate(date) {
  selectedDate = date;
  if (date.getMonth() !== viewDate.getMonth()) {
    viewDate = startOfMonth(date);
    loadMonth();
  } else {
    renderCalendar();
    renderAgendaForSelected();
  }
}

async function addEvent(title, time, member, startStr, endStr) {
  const { error } = await supabaseClient.from("fishing_events").insert({
    title,
    event_date: startStr,
    end_date: endStr,
    event_time: time || null,
    member,
  });
  if (error) {
    setStatus("추가 실패: " + error.message);
    return;
  }
  await loadMonth();
}

async function updateEventTitle(id, title) {
  const { error } = await supabaseClient.from("fishing_events").update({ title }).eq("id", id);
  if (error) {
    setStatus("수정 실패: " + error.message);
    return;
  }
  await loadMonth();
}

async function deleteEvent(id) {
  const { error } = await supabaseClient.from("fishing_events").delete().eq("id", id);
  if (error) {
    setStatus("삭제 실패: " + error.message);
    return;
  }
  await loadMonth();
}

document.getElementById("prev-month").addEventListener("click", () => {
  viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
  loadMonth();
});

document.getElementById("next-month").addEventListener("click", () => {
  viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
  loadMonth();
});

document.getElementById("today-btn").addEventListener("click", () => {
  viewDate = startOfMonth(new Date());
  selectedDate = new Date();
  loadMonth();
});

const eventTimeInput = document.getElementById("event-time");
eventTimeInput.addEventListener("input", () => {
  eventTimeInput.style.height = "auto";
  eventTimeInput.style.height = eventTimeInput.scrollHeight + "px";
});

const eventForm = document.getElementById("event-form");
eventForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = document.getElementById("event-title").value.trim();
  const time = eventTimeInput.value.trim();
  const member = document.getElementById("event-member").value.trim();
  if (!title || !member) return;

  const startStr = pendingRangeStart ? localDateString(pendingRangeStart) : localDateString(selectedDate);
  const endStr = pendingRangeEnd ? localDateString(pendingRangeEnd) : startStr;

  document.getElementById("event-title").value = "";
  eventTimeInput.value = "";
  eventTimeInput.style.height = "auto";
  document.getElementById("event-member").value = "";
  resetRangePicking();
  addEvent(title, time, member, startStr, endStr);
});

supabaseClient
  .channel("fishing-events-changes")
  .on("postgres_changes", { event: "*", schema: "public", table: "fishing_events" }, () => {
    loadMonth();
  })
  .subscribe();

loadMonth();
