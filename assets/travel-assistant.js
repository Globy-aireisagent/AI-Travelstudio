const jQuery = window.jQuery
const travel_assistant_ajax = window.travel_assistant_ajax

jQuery(document).ready(($) => {
  let currentStep = "upload"
  const uploadedFiles = []
  const sessionId = $("#travel-assistant-app").data("session")
  let isRecording = false
  let mediaRecorder = null

  // Initialize
  init()

  function init() {
    setupEventListeners()
    updateStepVisibility()
  }

  function setupEventListeners() {
    // File upload
    $("#upload-dropzone").on("click", () => {
      $("#file-input").click()
    })

    $("#file-input").on("change", handleFileSelect)

    // Drag and drop
    $("#upload-dropzone").on("dragover", function (e) {
      e.preventDefault()
      $(this).addClass("dragover")
    })

    $("#upload-dropzone").on("dragleave", function (e) {
      e.preventDefault()
      $(this).removeClass("dragover")
    })

    $("#upload-dropzone").on("drop", function (e) {
      e.preventDefault()
      $(this).removeClass("dragover")
      handleFileSelect(e.originalEvent)
    })

    // URL management
    $("#add-url-btn").on("click", addUrlInput)

    // Navigation
    $("#next-to-intake").on("click", () => {
      if (uploadedFiles.length > 0) {
        goToStep("intake")
      }
    })

    $("#back-to-upload").on("click", () => {
      goToStep("upload")
    })

    // Intake form
    $("#intake-form").on("submit", handleIntakeSubmit)

    // Children toggle
    $('input[name="kinderen_mee"]').on("change", function () {
      if ($(this).val() === "ja") {
        $("#kinderen-details").show()
      } else {
        $("#kinderen-details").hide()
      }
    })

    // Chat
    $("#chat-input").on("keypress", (e) => {
      if (e.which === 13 && !e.shiftKey) {
        e.preventDefault()
        sendMessage()
      }
    })

    $("#send-btn").on("click", sendMessage)
    $("#voice-btn").on("click", toggleRecording)
  }

  function handleFileSelect(e) {
    let files
    if (e.originalEvent && e.originalEvent.dataTransfer) {
      files = e.originalEvent.dataTransfer.files
    } else {
      files = e.target.files
    }

    for (let i = 0; i < files.length; i++) {
      uploadFile(files[i])
    }
  }

  function uploadFile(file) {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("action", "upload_document")
    formData.append("nonce", travel_assistant_ajax.nonce)

    $.ajax({
      url: travel_assistant_ajax.ajax_url,
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      success: (response) => {
        if (response.success) {
          uploadedFiles.push({
            name: file.name,
            size: file.size,
            url: response.data.url,
            type: "file",
          })
          updateUploadedFilesList()
          updateNextButton()
        }
      },
      error: () => {
        alert("Upload mislukt voor: " + file.name)
      },
    })
  }

  function updateUploadedFilesList() {
    let html = "<h3>📁 Geüploade bestanden</h3>"
    uploadedFiles.forEach((file, index) => {
      html += `
                <div class="uploaded-file">
                    <span>📄 ${file.name}</span>
                    <span class="file-size">(${formatFileSize(file.size)})</span>
                    <button type="button" onclick="removeFile(${index})">❌</button>
                </div>
            `
    })
    $("#uploaded-files").html(html)
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  function removeFile(index) {
    uploadedFiles.splice(index, 1)
    updateUploadedFilesList()
    updateNextButton()
  }

  function addUrlInput() {
    $("#url-inputs").append('<input type="url" placeholder="https://example.com" class="ta-url-input">')
  }

  function updateNextButton() {
    $("#next-to-intake").prop("disabled", uploadedFiles.length === 0)
  }

  function goToStep(step) {
    // Hide all steps
    $(".ta-step-content").hide()
    $(".ta-step").removeClass("active completed")

    // Show current step
    $("#step-" + step).show()
    $('[data-step="' + step + '"]').addClass("active")

    // Mark previous steps as completed
    if (step === "intake") {
      $('[data-step="upload"]').addClass("completed")
    } else if (step === "chat") {
      $('[data-step="upload"], [data-step="intake"]').addClass("completed")
    }

    currentStep = step
  }

  function handleIntakeSubmit(e) {
    e.preventDefault()

    const formData = {}
    $("#intake-form")
      .serializeArray()
      .forEach((item) => {
        if (formData[item.name]) {
          if (Array.isArray(formData[item.name])) {
            formData[item.name].push(item.value)
          } else {
            formData[item.name] = [formData[item.name], item.value]
          }
        } else {
          formData[item.name] = item.value
        }
      })

    // Save intake data
    $.ajax({
      url: travel_assistant_ajax.ajax_url,
      type: "POST",
      data: {
        action: "save_intake",
        nonce: travel_assistant_ajax.nonce,
        session_id: sessionId,
        intake_data: formData,
      },
      success: (response) => {
        if (response.success) {
          // Update chat interface with user info
          $("#user-name-display").text(formData.naam || "Reiziger")
          $("#documents-count").text(uploadedFiles.length)

          // Enable chat input
          $("#chat-input").prop("disabled", false)

          goToStep("chat")
        } else {
          alert("Fout bij opslaan gegevens")
        }
      },
    })
  }

  function sendMessage() {
    const message = $("#chat-input").val().trim()
    if (!message) return

    // Add user message to chat
    addMessageToChat("user", message)
    $("#chat-input").val("")
    $("#send-btn").prop("disabled", true)

    // Show typing indicator
    addTypingIndicator()

    // Send to server
    $.ajax({
      url: travel_assistant_ajax.ajax_url,
      type: "POST",
      data: {
        action: "chat_message",
        nonce: travel_assistant_ajax.nonce,
        session_id: sessionId,
        message: message,
      },
      success: (response) => {
        removeTypingIndicator()
        $("#send-btn").prop("disabled", false)

        if (response.success) {
          addMessageToChat("assistant", response.data.response)
        } else {
          addMessageToChat("assistant", "Sorry, er ging iets mis. Probeer het opnieuw.")
        }
      },
      error: () => {
        removeTypingIndicator()
        $("#send-btn").prop("disabled", false)
        addMessageToChat("assistant", "Sorry, er ging iets mis. Probeer het opnieuw.")
      },
    })
  }

  function addMessageToChat(role, content) {
    const avatar = role === "user" ? "👤" : "🤖"
    const messageClass = "ta-message-" + role

    const messageHtml = `
            <div class="ta-message ${messageClass}">
                <div class="ta-message-avatar">${avatar}</div>
                <div class="ta-message-content">
                    <p>${content.replace(/\n/g, "<br>")}</p>
                </div>
            </div>
        `

    $("#chat-messages").append(messageHtml)
    scrollChatToBottom()
  }

  function addTypingIndicator() {
    const typingHtml = `
            <div class="ta-message ta-message-assistant typing-indicator">
                <div class="ta-message-avatar">🤖</div>
                <div class="ta-message-content">
                    <div class="ta-typing">
                        <div class="ta-typing-dot"></div>
                        <div class="ta-typing-dot"></div>
                        <div class="ta-typing-dot"></div>
                    </div>
                </div>
            </div>
        `

    $("#chat-messages").append(typingHtml)
    scrollChatToBottom()
  }

  function removeTypingIndicator() {
    $(".typing-indicator").remove()
  }

  function scrollChatToBottom() {
    const chatMessages = $("#chat-messages")[0]
    chatMessages.scrollTop = chatMessages.scrollHeight
  }

  function toggleRecording() {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  function startRecording() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Spraakherkenning wordt niet ondersteund in deze browser.")
      return
    }

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        mediaRecorder = new MediaRecorder(stream)
        const audioChunks = []

        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data)
        }

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: "audio/wav" })
          transcribeAudio(audioBlob)
          stream.getTracks().forEach((track) => track.stop())
        }

        mediaRecorder.start()
        isRecording = true
        $("#voice-btn").addClass("recording")
        $("#voice-status").show()
      })
      .catch((error) => {
        console.error("Microfoon toegang geweigerd:", error)
        alert("Kon microfoon niet activeren. Controleer je browser instellingen.")
      })
  }

  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop()
      isRecording = false
      $("#voice-btn").removeClass("recording")
      $("#voice-status").hide()
    }
  }

  function transcribeAudio(audioBlob) {
    // Note: This would require a separate transcription endpoint
    // For now, we'll just show a placeholder
    $("#chat-input").val("Spraak wordt nog niet ondersteund in deze demo versie.")
    $("#chat-input").focus()
  }

  function updateStepVisibility() {
    goToStep(currentStep)
  }

  // Make removeFile globally accessible
  window.removeFile = removeFile
})
