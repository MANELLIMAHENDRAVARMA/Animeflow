const video = document.getElementById("video");
const drop = document.getElementById("drop");
const details = document.getElementById("details");
const generate = document.getElementById("generate");
const result = document.getElementById("result");
const again = document.getElementById("again");

const API = "https://animeflow-api.mahi934717.workers.dev";

let selectedVideo = null;
let referenceImage = null;

drop.addEventListener("click", () => video.click());

video.addEventListener("change", () => {
  selectedVideo = video.files[0] || null;

  if (!selectedVideo) return;

  if (!selectedVideo.type.startsWith("video/")) {
    alert("Please select a video file.");
    selectedVideo = null;
    return;
  }

  if (selectedVideo.size > 100 * 1024 * 1024) {
    alert("For this first test, please use a video under 100 MB.");
    selectedVideo = null;
    return;
  }

  details.textContent =
    `${selectedVideo.name} • ${(selectedVideo.size / 1024 / 1024).toFixed(1)} MB`;
});

const ref = document.getElementById("reference");

if (ref) {
  ref.addEventListener("change", () => {
    referenceImage = ref.files[0] || null;
  });
}

document.querySelectorAll(".styles button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".styles button").forEach((b) => {
      b.classList.remove("active");
    });

    button.classList.add("active");
  });
});

generate.addEventListener("click", async () => {
  if (!selectedVideo) {
    alert("Please upload a video first.");
    return;
  }

  generate.disabled = true;
  generate.textContent = "Uploading…";

  result.hidden = true;

  try {
    const form = new FormData();

    form.append("video", selectedVideo);

    const activeStyle =
      document.querySelector(".styles button.active");

    form.append(
      "style",
      activeStyle?.dataset.style || "cinematic"
    );

    form.append("mode", "flex_1");

    if (referenceImage) {
      form.append("reference", referenceImage);
    }

    const response = await fetch(`${API}/generate`, {
      method: "POST",
      body: form
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
        data.error ||
        "Generation request failed."
      );
    }

    generate.textContent = "Processing…";

    const predictionId = data.prediction_id;

    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const statusResponse = await fetch(
        `${API}/status/${predictionId}`
      );

      const statusData = await statusResponse.json();

      if (
        statusData.status === "succeeded" &&
        statusData.output
      ) {
        showResult(statusData.output);
        break;
      }

      if (
        statusData.status === "failed" ||
        statusData.status === "canceled"
      ) {
        throw new Error(
          statusData.error || "AI generation failed."
        );
      }

      generate.textContent =
        `Processing… ${statusData.status || ""}`;
    }
  } catch (error) {
    alert(error.message);
  } finally {
    generate.disabled = false;
    generate.textContent = "Generate anime video";
  }
});

function showResult(output) {
  const outputUrl =
    Array.isArray(output) ? output[0] : output;

  result.hidden = false;

  const existingVideo =
    result.querySelector("video");

  if (existingVideo) {
    existingVideo.src = outputUrl;
  }

  const download =
    result.querySelector("a");

  if (download) {
    download.href = outputUrl;
    download.download = "animeflow-result.mp4";
  }

  result.scrollIntoView({
    behavior: "smooth"
  });
}

again.addEventListener("click", () => {
  result.hidden = true;
  video.value = "";
  selectedVideo = null;
  referenceImage = null;
  details.textContent = "";
});
