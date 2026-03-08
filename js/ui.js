// let detector = null;
// let isAnalyzing = false;

// const adjacentPairs = [
//   ["left_shoulder", "right_shoulder"],
//   ["left_shoulder", "left_elbow"],
//   ["left_elbow", "left_wrist"],
//   ["right_shoulder", "right_elbow"],
//   ["right_elbow", "right_wrist"],
//   ["left_shoulder", "left_hip"],
//   ["right_shoulder", "right_hip"],
//   ["left_hip", "right_hip"],
//   ["left_hip", "left_knee"],
//   ["left_knee", "left_ankle"],
//   ["right_hip", "right_knee"],
//   ["right_knee", "right_ankle"]
// ];

// function resizeOverlay(video, overlay) {
//   const width = video.videoWidth || video.clientWidth || 640;
//   const height = video.videoHeight || video.clientHeight || 360;
//   overlay.width = width;
//   overlay.height = height;
// }

// function getKeypointMap(keypoints) {
//   const map = {};
//   keypoints.forEach(kp => {
//     if (kp.name && kp.score > 0.3) {
//       map[kp.name] = kp;
//     }
//   });
//   return map;
// }

// function drawCircle(ctx, x, y, r = 4) {
//   ctx.beginPath();
//   ctx.arc(x, y, r, 0, Math.PI * 2);
//   ctx.fillStyle = "#00e0ff";
//   ctx.fill();
// }

// function drawLine(ctx, a, b) {
//   ctx.beginPath();
//   ctx.moveTo(a.x, a.y);
//   ctx.lineTo(b.x, b.y);
//   ctx.strokeStyle = "#39ff14";
//   ctx.lineWidth = 3;
//   ctx.stroke();
// }

// function drawRouteBox(ctx, box) {
//   ctx.strokeStyle = "#ffd60a";
//   ctx.lineWidth = 3;
//   ctx.strokeRect(box.x, box.y, box.w, box.h);
// }

// function drawPose(ctx, overlay, keypoints, routeBoxes = []) {
//   ctx.clearRect(0, 0, overlay.width, overlay.height);

//   for (const box of routeBoxes) {
//     drawRouteBox(ctx, box);
//   }

//   const map = getKeypointMap(keypoints);

//   for (const [p1, p2] of adjacentPairs) {
//     if (map[p1] && map[p2]) drawLine(ctx, map[p1], map[p2]);
//   }

//   Object.values(map).forEach(kp => drawCircle(ctx, kp.x, kp.y));
// }

// function angleABC(a, b, c) {
//   const ab = { x: a.x - b.x, y: a.y - b.y };
//   const cb = { x: c.x - b.x, y: c.y - b.y };

//   const dot = ab.x * cb.x + ab.y * cb.y;
//   const magAB = Math.sqrt(ab.x * ab.x + ab.y * ab.y);
//   const magCB = Math.sqrt(cb.x * cb.x + cb.y * cb.y);

//   if (magAB === 0 || magCB === 0) return null;

//   const cos = Math.max(-1, Math.min(1, dot / (magAB * magCB)));
//   return Math.acos(cos) * (180 / Math.PI);
// }

// function rgbToHsv(r, g, b) {
//   r /= 255;
//   g /= 255;
//   b /= 255;

//   const max = Math.max(r, g, b);
//   const min = Math.min(r, g, b);
//   const d = max - min;

//   let h = 0;
//   const s = max === 0 ? 0 : d / max;
//   const v = max;

//   if (d !== 0) {
//     switch (max) {
//       case r:
//         h = ((g - b) / d) % 6;
//         break;
//       case g:
//         h = (b - r) / d + 2;
//         break;
//       case b:
//         h = (r - g) / d + 4;
//         break;
//     }
//     h *= 60;
//     if (h < 0) h += 360;
//   }

//   return { h, s, v };
// }

// function isRouteCandidate(r, g, b) {
//   const { h, s, v } = rgbToHsv(r, g, b);
//   const targetHueBand = (h >= 310 && h <= 350) || (h >= 0 && h <= 10);
//   const isBrightEnough = v > 0.4;
//   const isSaturatedEnough = s > 0.45;
//   return targetHueBand && isBrightEnough && isSaturatedEnough;
// }

// function detectRouteFeaturesFromFrame(ctx, overlay) {
//   const width = overlay.width;
//   const height = overlay.height;
//   const imageData = ctx.getImageData(0, 0, width, height);
//   const data = imageData.data;

//   const step = 8;
//   const minPixels = 14;
//   const visited = new Set();
//   const boxes = [];

//   function idx(x, y) {
//     return `${x},${y}`;
//   }

//   function getPixel(x, y) {
//     const i = (y * width + x) * 4;
//     return {
//       r: data[i],
//       g: data[i + 1],
//       b: data[i + 2]
//     };
//   }

//   for (let y = 0; y < height; y += step) {
//     for (let x = 0; x < width; x += step) {
//       const key = idx(x, y);
//       if (visited.has(key)) continue;

//       const { r, g, b } = getPixel(x, y);
//       if (!isRouteCandidate(r, g, b)) continue;

//       const queue = [{ x, y }];
//       visited.add(key);

//       let pixels = [];
//       let minX = x, maxX = x, minY = y, maxY = y;

//       while (queue.length) {
//         const p = queue.shift();
//         pixels.push(p);

//         minX = Math.min(minX, p.x);
//         maxX = Math.max(maxX, p.x);
//         minY = Math.min(minY, p.y);
//         maxY = Math.max(maxY, p.y);

//         const neighbors = [
//           { x: p.x + step, y: p.y },
//           { x: p.x - step, y: p.y },
//           { x: p.x, y: p.y + step },
//           { x: p.x, y: p.y - step }
//         ];

//         for (const n of neighbors) {
//           if (n.x < 0 || n.y < 0 || n.x >= width || n.y >= height) continue;
//           const nKey = idx(n.x, n.y);
//           if (visited.has(nKey)) continue;

//           const np = getPixel(n.x, n.y);
//           if (isRouteCandidate(np.r, np.g, np.b)) {
//             visited.add(nKey);
//             queue.push(n);
//           }
//         }
//       }

//       const boxW = maxX - minX + step;
//       const boxH = maxY - minY + step;

//       if (
//         pixels.length >= minPixels &&
//         boxW >= 24 &&
//         boxH >= 24 &&
//         boxW <= 180 &&
//         boxH <= 180
//       ) {
//         boxes.push({ x: minX, y: minY, w: boxW, h: boxH });
//       }
//     }
//   }

//   return mergeBoxes(boxes);
// }

// function overlap(a, b) {
//   return !(
//     a.x + a.w < b.x ||
//     b.x + b.w < a.x ||
//     a.y + a.h < b.y ||
//     b.y + b.h < a.y
//   );
// }

// function mergeBoxes(boxes) {
//   const merged = [];

//   for (const box of boxes) {
//     let combined = false;

//     for (const m of merged) {
//       if (overlap(box, m)) {
//         const minX = Math.min(box.x, m.x);
//         const minY = Math.min(box.y, m.y);
//         const maxX = Math.max(box.x + box.w, m.x + m.w);
//         const maxY = Math.max(box.y + box.h, m.y + m.h);

//         m.x = minX;
//         m.y = minY;
//         m.w = maxX - minX;
//         m.h = maxY - minY;
//         combined = true;
//         break;
//       }
//     }

//     if (!combined) {
//       merged.push({ ...box });
//     }
//   }

//   return merged.filter(box => box.w >= 24 && box.h >= 24);
// }

// function getBoxCenter(box) {
//   return {
//     x: box.x + box.w / 2,
//     y: box.y + box.h / 2
//   };
// }

// function countNearbyOptions(point, boxes, threshold) {
//   if (!point) return 0;
//   let count = 0;
//   for (const box of boxes) {
//     const c = getBoxCenter(box);
//     if (distance(point, c) <= threshold) count++;
//   }
//   return count;
// }

// function analyzeMetrics(metricStore) {
//   const avgElbowAngle = average(metricStore.elbowAngles);
//   const avgKneeAngle = average(metricStore.kneeAngles);
//   const avgWristMove = average(metricStore.wristMoves);
//   const avgAnkleMove = average(metricStore.ankleMoves);
//   const avgHipSway = average(metricStore.hipSways);
//   const avgHoldCount = average(metricStore.holdCounts);
//   const avgHandOptions = average(metricStore.handNearbyCounts);
//   const avgFootOptions = average(metricStore.footNearbyCounts);

//   const stats = {
//     frames: metricStore.frames,
//     avgElbowAngle,
//     avgKneeAngle,
//     avgWristMove,
//     avgAnkleMove,
//     avgHipSway,
//     avgHoldCount,
//     avgHandOptions,
//     avgFootOptions
//   };

//   const feedbackCards = [];

//   if (metricStore.frames < 10) {
//     feedbackCards.push({
//       title: "Not enough readable movement",
//       text: "The model could not read enough clear frames to give useful climbing feedback. Try a steadier video with your full body visible."
//     });
//     return { stats, feedbackCards };
//   }

//   if (avgAnkleMove !== null && avgWristMove !== null) {
//     if (avgAnkleMove > 22) {
//       feedbackCards.push({
//         title: "Work on more precise foot placements",
//         text: "Your feet appear to reposition quite a lot during the climb. Try placing each foot more deliberately and quietly, like in a silent-feet drill, instead of readjusting after contact."
//       });
//     } else {
//       feedbackCards.push({
//         title: "Footwork looks fairly deliberate",
//         text: "Your lower-body movement stays relatively controlled, which is a good sign that you are placing your feet with more intention instead of constantly readjusting."
//       });
//     }
//   }

//   if (avgElbowAngle !== null) {
//     if (avgElbowAngle < 105) {
//       feedbackCards.push({
//         title: "Try climbing with straighter arms",
//         text: "Your arms stay fairly bent on average, which can tire out the biceps quickly. Whenever possible, hang on straighter arms and let your legs do more of the lifting."
//       });
//     } else if (avgElbowAngle < 135) {
//       feedbackCards.push({
//         title: "Arm usage is decent, but can be more efficient",
//         text: "You are not constantly fully bent, but there is still room to relax through straighter arms on easier positions so you save energy for harder moves."
//       });
//     } else {
//       feedbackCards.push({
//         title: "Good use of straighter arms",
//         text: "Your arm positions look relatively relaxed overall, which usually means you are conserving upper-body energy instead of over-pulling."
//       });
//     }
//   }

//   if (avgHipSway !== null) {
//     if (avgHipSway > 45) {
//       feedbackCards.push({
//         title: "Keep your hips closer and more stable",
//         text: "Your hips move around quite a bit between positions. Bringing your hips in closer to the wall and moving them more intentionally can improve balance and reduce how much weight your hands carry."
//       });
//     } else if (avgHipSway > 28) {
//       feedbackCards.push({
//         title: "Hip positioning is okay, but could be tighter",
//         text: "There is some extra movement through the hips. Before reaching, try shifting your hips into the wall more deliberately so each move feels more controlled."
//       });
//     } else {
//       feedbackCards.push({
//         title: "Hip movement looks controlled",
//         text: "Your hips stay comparatively steady, which is a good sign for balance and body positioning on the wall."
//       });
//     }
//   }

//   if (avgWristMove !== null && avgAnkleMove !== null) {
//     if (avgWristMove > 35 && avgAnkleMove > 20) {
//       feedbackCards.push({
//         title: "Slow down and move more deliberately",
//         text: "Your movement looks fairly large and active through both hands and feet, which can mean you are rushing from hold to hold. Try pausing, looking at the next position, and executing each move with more intention."
//       });
//     } else if (avgWristMove > 35) {
//       feedbackCards.push({
//         title: "Plan hand movements a bit more before committing",
//         text: "Your hands appear to travel a lot between positions. Before moving, take a moment to look at the next hold and decide exactly how you want to use it."
//       });
//     } else {
//       feedbackCards.push({
//         title: "Movement looks reasonably intentional",
//         text: "Your overall motion does not look overly rushed. Keeping that habit of planning before moving will help as climbs get harder."
//       });
//     }
//   }

//   if (avgFootOptions != null && avgHandOptions != null) {
//     if (avgFootOptions < 0.7 && avgHandOptions > 1.0) {
//       feedbackCards.push({
//         title: "Focus on staying more connected to the wall",
//         text: "There are moments where your upper body seems to move before you establish a strong lower-body base. Try to keep three points of contact whenever possible so you move from a stable position instead of rushing into the next reach."
//       });
//     } else if (avgFootOptions >= 1.0) {
//       feedbackCards.push({
//         title: "Use available footholds to improve balance",
//         text: "There seem to be regular lower-body options available during the climb. Making better use of those footholds can help you maintain three points of contact and climb with more control."
//       });
//     }
//   }

//   if (
//     avgElbowAngle !== null &&
//     avgWristMove !== null &&
//     avgAnkleMove !== null &&
//     avgElbowAngle < 110 &&
//     avgWristMove > avgAnkleMove * 1.5
//   ) {
//     feedbackCards.push({
//       title: "You may be pulling before setting your feet",
//       text: "A common beginner habit is reaching and pulling with the arms before the feet are truly set. Try trusting your feet more, then push upward instead of immediately hauling with the hands."
//     });
//   }

//   if (avgHoldCount !== null) {
//     feedbackCards.push({
//       title: "Route context detected",
//       text: `The app found about ${avgHoldCount.toFixed(1)} route features per sampled frame and used that context to estimate how many movement options were available around your hands and feet.`
//     });
//   }

//   feedbackCards.push({
//     title: "How to use this feedback",
//     text: "Treat this as beginner movement coaching: quiet feet, straighter arms, hips in, slower decisions, and better balance through three points of contact."
//   });

//   return { stats, feedbackCards };
// }

// async function loadModel(setStatus) {
//   if (detector) return detector;

//   setStatus("Loading pose model...", true);
//   await tf.setBackend("webgl");
//   await tf.ready();

//   detector = await poseDetection.createDetector(
//     poseDetection.SupportedModels.MoveNet,
//     {
//       modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
//     }
//   );

//   setStatus("Pose model loaded", false);
//   return detector;
// }

// async function analyzeVideo({
//   video,
//   overlay,
//   ctx,
//   currentVideoFile,
//   setStatus,
//   setFeedbackCards,
//   updateStats,
//   setError,
//   onResult,
//   analyzeBtn,
//   saveBtn
// }) {
//   setError("");

//   if (!currentVideoFile || !video.src) {
//     setError("Upload a video before analyzing.");
//     return;
//   }

//   if (isAnalyzing) return;

//   try {
//     isAnalyzing = true;
//     analyzeBtn.disabled = true;
//     saveBtn.disabled = true;
//     setFeedbackCards([]);
//     setStatus("Loading pose model...", true);

//     await loadModel(setStatus);

//     const metricStore = {
//       frames: 0,
//       elbowAngles: [],
//       kneeAngles: [],
//       wristMoves: [],
//       ankleMoves: [],
//       hipSways: [],
//       holdCounts: [],
//       handNearbyCounts: [],
//       footNearbyCounts: []
//     };

//     let prevLeftWrist = null;
//     let prevRightWrist = null;
//     let prevLeftAnkle = null;
//     let prevRightAnkle = null;
//     let prevHipMidX = null;

//     video.pause();
//     video.currentTime = 0;

//     const duration = video.duration;
//     if (!duration || !isFinite(duration)) {
//       setStatus("Invalid video", false);
//       setError("This video could not be analyzed.");
//       return;
//     }

//     const sampleEveryMs = 250;

//     for (let t = 0; t < duration; t += sampleEveryMs / 1000) {
//       if (!isAnalyzing) break;

//       video.currentTime = Math.min(t, duration);

//       await new Promise((resolve) => {
//         const onSeeked = () => {
//           video.removeEventListener("seeked", onSeeked);
//           resolve();
//         };
//         video.addEventListener("seeked", onSeeked);
//       });

//       resizeOverlay(video, overlay);

//       ctx.clearRect(0, 0, overlay.width, overlay.height);
//       ctx.drawImage(video, 0, 0, overlay.width, overlay.height);

//       const routeBoxes = detectRouteFeaturesFromFrame(ctx, overlay);
//       metricStore.holdCounts.push(routeBoxes.length);

//       const poses = await detector.estimatePoses(video, {
//         flipHorizontal: false
//       });

//       if (!poses.length || !poses[0].keypoints) {
//         drawPose(ctx, overlay, [], routeBoxes);
//         continue;
//       }

//       const keypoints = poses[0].keypoints;
//       drawPose(ctx, overlay, keypoints, routeBoxes);
//       const kp = getKeypointMap(keypoints);

//       const ls = kp.left_shoulder;
//       const le = kp.left_elbow;
//       const lw = kp.left_wrist;
//       const rs = kp.right_shoulder;
//       const re = kp.right_elbow;
//       const rw = kp.right_wrist;
//       const lh = kp.left_hip;
//       const rh = kp.right_hip;
//       const lk = kp.left_knee;
//       const rk = kp.right_knee;
//       const la = kp.left_ankle;
//       const ra = kp.right_ankle;

//       if (ls && le && lw) {
//         const angle = angleABC(ls, le, lw);
//         if (angle) metricStore.elbowAngles.push(angle);
//       }
//       if (rs && re && rw) {
//         const angle = angleABC(rs, re, rw);
//         if (angle) metricStore.elbowAngles.push(angle);
//       }

//       if (lh && lk && la) {
//         const angle = angleABC(lh, lk, la);
//         if (angle) metricStore.kneeAngles.push(angle);
//       }
//       if (rh && rk && ra) {
//         const angle = angleABC(rh, rk, ra);
//         if (angle) metricStore.kneeAngles.push(angle);
//       }

//       if (lw && prevLeftWrist) {
//         metricStore.wristMoves.push(distance(lw, prevLeftWrist));
//       }
//       if (rw && prevRightWrist) {
//         metricStore.wristMoves.push(distance(rw, prevRightWrist));
//       }

//       if (la && prevLeftAnkle) {
//         metricStore.ankleMoves.push(distance(la, prevLeftAnkle));
//       }
//       if (ra && prevRightAnkle) {
//         metricStore.ankleMoves.push(distance(ra, prevRightAnkle));
//       }

//       if (lh && rh) {
//         const hipMidX = (lh.x + rh.x) / 2;
//         if (prevHipMidX !== null) {
//           metricStore.hipSways.push(Math.abs(hipMidX - prevHipMidX));
//         }
//         prevHipMidX = hipMidX;
//       }

//       const handThreshold = 130;
//       const footThreshold = 105;

//       const nearbyHands =
//         countNearbyOptions(lw, routeBoxes, handThreshold) +
//         countNearbyOptions(rw, routeBoxes, handThreshold);

//       const nearbyFeet =
//         countNearbyOptions(la, routeBoxes, footThreshold) +
//         countNearbyOptions(ra, routeBoxes, footThreshold);

//       metricStore.handNearbyCounts.push(nearbyHands / 2);
//       metricStore.footNearbyCounts.push(nearbyFeet / 2);

//       prevLeftWrist = lw || prevLeftWrist;
//       prevRightWrist = rw || prevRightWrist;
//       prevLeftAnkle = la || prevLeftAnkle;
//       prevRightAnkle = ra || prevRightAnkle;

//       metricStore.frames++;
//       setStatus(`Analyzing... ${Math.round((t / duration) * 100)}%`, true);
//     }

//     const result = analyzeMetrics(metricStore);
//     updateStats(result.stats);
//     setFeedbackCards(result.feedbackCards);
//     onResult(result);
//     setStatus("Analysis complete", false);
//   } catch (error) {
//     console.error(error);
//     setError("Analysis failed. Try another video or refresh the page.");
//     setStatus("Analysis failed", false);
//   } finally {
//     isAnalyzing = false;
//     analyzeBtn.disabled = false;
//     saveBtn.disabled = false;
//   }
// }