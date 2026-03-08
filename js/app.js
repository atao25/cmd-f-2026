// let db = null;
// let currentVideoFile = null;
// let currentVideoObjectURL = null;
// let analysisResult = null;

// document.addEventListener("DOMContentLoaded", async () => {
//   const ui = createUIRefs();

//   async function resetFormAndAnalysis() {
//     ui.form.reset();
//     analysisResult = null;
//     currentVideoFile = null;

//     if (currentVideoObjectURL) {
//       URL.revokeObjectURL(currentVideoObjectURL);
//       currentVideoObjectURL = null;
//     }

//     ui.video.removeAttribute("src");
//     ui.video.load();
//     ui.ctx.clearRect(0, 0, ui.overlay.width, ui.overlay.height);

//     setStatus(ui, "Upload a video to begin", false);
//     updateStats(ui, {
//       frames: 0,
//       avgElbowAngle: null,
//       avgKneeAngle: null,
//       avgWristMove: null,
//       avgAnkleMove: null,
//       avgHipSway: null,
//       avgHoldCount: null,
//       avgHandOptions: null,
//       avgFootOptions: null
//     });
//     setFeedbackCards(ui, []);
//     setError(ui, "");
//   }

//   async function handleVideoSelected(event) {
//     const file = event.target.files && event.target.files[0];
//     if (!file) return;

//     currentVideoFile = file;
//     analysisResult = null;

//     if (currentVideoObjectURL) {
//       URL.revokeObjectURL(currentVideoObjectURL);
//     }

//     currentVideoObjectURL = URL.createObjectURL(file);
//     ui.video.src = currentVideoObjectURL;
//     ui.video.load();

//     setStatus(ui, "Video loaded. Fill details and analyze the climb.", false);
//     updateStats(ui, {
//       frames: 0,
//       avgElbowAngle: null,
//       avgKneeAngle: null,
//       avgWristMove: null,
//       avgAnkleMove: null,
//       avgHipSway: null,
//       avgHoldCount: null,
//       avgHandOptions: null,
//       avgFootOptions: null
//     });
//     setFeedbackCards(ui, [{
//       title: "Video ready",
//       text: "Now run analysis. The generated feedback will be saved together with this climb entry."
//     }]);
//   }

//   async function handleAnalyze() {
//     await analyzeVideo({
//       video: ui.video,
//       overlay: ui.overlay,
//       ctx: ui.ctx,
//       currentVideoFile,
//       setStatus: (text, active) => setStatus(ui, text, active),
//       setFeedbackCards: (cards) => setFeedbackCards(ui, cards),
//       updateStats: (stats) => updateStats(ui, stats),
//       setError: (text) => setError(ui, text),
//       onResult: (result) => { analysisResult = result; },
//       analyzeBtn: ui.analyzeBtn,
//       saveBtn: ui.saveBtn
//     });
//   }

//   async function handleSave(event) {
//     event.preventDefault();

//     if (!validateForm(ui, currentVideoFile)) return;

//     let started = normalizeDate(ui.startedEl.value);
//     let completed = normalizeDate(ui.completedEl.value);

//     if (!started) started = normalizeDate(new Date());
//     if (ui.statusEl.value === "sent" && !completed) completed = normalizeDate(new Date());

//     if (!analysisResult) {
//       setError(ui, "Analyze the climb before saving so the entry includes feedback.");
//       return;
//     }

//     ui.saveBtn.disabled = true;
//     ui.analyzeBtn.disabled = true;

//     try {
//       await addClimbRecord(db, {
//         grade: ui.gradeEl.value,
//         name: ui.routeNameEl.value.trim(),
//         location: ui.locationEl.value.trim(),
//         status: ui.statusEl.value,
//         started,
//         completed,
//         attempts: ui.attemptsEl.value.trim() ? parseInt(ui.attemptsEl.value.trim(), 10) : null,
//         notes: ui.notesEl.value.trim(),
//         createdAt: new Date().toISOString(),
//         stats: analysisResult.stats,
//         feedbackCards: analysisResult.feedbackCards,
//         videoBlob: currentVideoFile
//       });

//       await renderSummaryAndLogbook(ui, db);
//       await resetFormAndAnalysis();
//       setStatus(ui, "Climb saved", false);
//     } catch (err) {
//       console.error(err);
//       setError(ui, "Could not save the climb entry.");
//     } finally {
//       ui.saveBtn.disabled = false;
//       ui.analyzeBtn.disabled = false;
//     }
//   }

//   async function handleLogbookClick(event) {
//     const btn = event.target.closest("button[data-action]");
//     if (!btn) return;

//     const action = btn.dataset.action;
//     const id = Number(btn.dataset.id);
//     if (!id) return;

//     if (action === "delete") {
//       await deleteClimbRecord(db, id);
//       await renderSummaryAndLogbook(ui, db);
//       return;
//     }

//     if (action === "view") {
//       const record = await getClimbRecord(db, id);
//       if (!record || !record.videoBlob) return;

//       const url = URL.createObjectURL(record.videoBlob);
//       ui.viewerVideo.src = url;
//       ui.viewerTitle.textContent = `${record.grade} · ${record.name || "Saved climb"}`;
//       ui.viewerModal.classList.add("open");
//       ui.viewerModal.dataset.url = url;
//     }
//   }

//   async function init() {
//     db = await openDB();
//     await renderSummaryAndLogbook(ui, db);

//     updateStats(ui, {
//       frames: 0,
//       avgElbowAngle: null,
//       avgKneeAngle: null,
//       avgWristMove: null,
//       avgAnkleMove: null,
//       avgHipSway: null,
//       avgHoldCount: null,
//       avgHandOptions: null,
//       avgFootOptions: null
//     });

//     setFeedbackCards(ui, []);
//     setStatus(ui, "Upload a video to begin", false);
//   }

//   ui.video.addEventListener("loadedmetadata", () => resizeOverlay(ui.video, ui.overlay));
//   window.addEventListener("resize", () => {
//     if (ui.video.videoWidth) resizeOverlay(ui.video, ui.overlay);
//   });

//   ui.videoInputEl.addEventListener("change", handleVideoSelected);
//   ui.analyzeBtn.addEventListener("click", handleAnalyze);
//   ui.resetBtn.addEventListener("click", resetFormAndAnalysis);
//   ui.form.addEventListener("submit", handleSave);
//   ui.logbookListEl.addEventListener("click", handleLogbookClick);
//   ui.closeViewerBtn.addEventListener("click", () => closeViewer(ui));
//   ui.viewerModal.addEventListener("click", (e) => {
//     if (e.target === ui.viewerModal) closeViewer(ui);
//   });

//   try {
//     await init();
//   } catch (err) {
//     console.error(err);
//     setError(ui, "Could not initialize local storage for climbs.");
//   }
// });