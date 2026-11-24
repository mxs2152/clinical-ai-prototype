import { useState } from 'react'
import './App.css'

const cases = {
  correct: {
    id: '001',
    title: 'Case 001 — Clinical Scenario A',
    patient: 'Example Patient A',
    findings: ['Elevated creatinine', 'Reduced urine output', 'Recent nephrotoxic medication'],
    diagnosis: 'Acute Kidney Injury (AKI)',
    alternative: 'Septic Shock',
    confidence: 87,
    recommendationSummary: 'The recommendation was based on elevated creatinine, reduced urine output and recent nephrotoxic medication.',
    explanation: [
      'Elevated creatinine indicates possible kidney injury.',
      'Reduced urine output supports impaired kidney function.',
      'Recent nephrotoxic medication provides an important clinical clue.'
    ],
    contrastiveExplanation: [
      'Taken together, these findings point more directly towards kidney dysfunction than towards the alternative diagnosis.'
    ],
    alternativeExplanation: [
      'Low blood pressure is not reported in the supplied case information.',
      'The available findings provide less direct support for septic shock than for kidney injury.',
      'The medication history and kidney function findings make acute kidney injury the more directly supported option in this simulated case.'
    ],
    warning: 'Review the available clinical findings, medication history and alternative diagnosis independently before making your final decision.'
  },
  incorrect: {
    id: '002',
    title: 'Case 002 — Clinical Scenario B',
    patient: 'Example Patient B',
    findings: ['Elevated inflammatory markers', 'Low blood pressure', 'Rising creatinine', 'Recent nephrotoxic medication'],
    diagnosis: 'Septic Shock',
    alternative: 'Drug-Induced Acute Kidney Injury',
    confidence: 91,
    recommendationSummary: 'The recommendation was influenced by elevated inflammatory markers and low blood pressure, while kidney-related findings also required consideration.',
    explanation: [
      'Elevated inflammatory markers influenced the simulated prediction.',
      'Low blood pressure contributed to the septic shock recommendation.'
    ],
    contrastiveExplanation: [
      'The recommendation gives substantial weight to infection-related indicators, but this does not resolve the kidney-related evidence.'
    ],
    alternativeExplanation: [
      'Rising creatinine is an important indicator of possible kidney injury.',
      'Recent nephrotoxic medication is a relevant risk factor that should be considered.',
      'The simulated recommendation did not adequately account for these kidney-related findings and the medication history.'
    ],
    warning: 'Review the available clinical findings, medication history and alternative diagnosis independently before making your final decision.'
  }
}

const validDiagnoses = [
  {
    label: 'Acute Kidney Injury (AKI)',
    aliases: ['acute kidney injury', 'acute kidney injury aki', 'aki']
  },
  {
    label: 'Septic Shock',
    aliases: ['septic shock']
  },
  {
    label: 'Drug-Induced Acute Kidney Injury',
    aliases: ['drug induced acute kidney injury', 'drug induced kidney injury']
  }
]

const diagnosisSuggestions = {
  'suspected kidney injury': 'Acute Kidney Injury (AKI)',
  'possible kidney injury': 'Acute Kidney Injury (AKI)',
  kidney: 'Acute Kidney Injury (AKI)',
  'kidney injury': 'Acute Kidney Injury (AKI)',
  'acute kideny injury': 'Acute Kidney Injury (AKI)',
  'acute kidney injry': 'Acute Kidney Injury (AKI)',
  'acute kidney injurie': 'Acute Kidney Injury (AKI)',
  'acute kidney injur': 'Acute Kidney Injury (AKI)',
  'septic shoc': 'Septic Shock',
  'septic shok': 'Septic Shock',
  'septic shockk': 'Septic Shock',
  'skeptic shock': 'Septic Shock',
  septic: 'Septic Shock',
  'drug induced acute kidney': 'Drug-Induced Acute Kidney Injury',
  'drug induced kidney': 'Drug-Induced Acute Kidney Injury',
  'drug induced kidney injury': 'Drug-Induced Acute Kidney Injury',
  'drug induced acute kideny injury': 'Drug-Induced Acute Kidney Injury',
  'drug induced acute kidney injry': 'Drug-Induced Acute Kidney Injury',
  'drug induced acute kidney injur': 'Drug-Induced Acute Kidney Injury',
  'drug induced acute kideny': 'Drug-Induced Acute Kidney Injury',
  'drug induced acute kidney inj': 'Drug-Induced Acute Kidney Injury'
}

const incompleteDiagnosisEntries = [
  'k', 'ki', 'kin', 'kid', 'kidn', 'kidne',
  'a', 'ac', 'acu', 'acut', 'acute k', 'acute ki',
  'acute kid', 'acute kidn', 'acute kidne',
  'se', 'sep', 'sept', 'septi', 'septic s',
  'septic sh', 'septic sho',
  'drug', 'drug i', 'drug in', 'drug ind',
  'drug indu', 'drug induc', 'drug induce', 'drug induced a',
  'drug induced acute',
  'drug induced acute k',
  'drug induced acute ki',
  'drug induced acute kid',
  'drug induced acute kidn',
  'drug induced acute kidne',
  'drug induced acute kidney',
  'drug induced kidney',
  'drug induced kidney i',
  'drug induced kidney in',
  'drug induced kidney inj',
  'drug induced kidney inju'
]

const createEmptyCaseState = () => ({
  initialDiagnosis: '',
  initialSuggestion: '',
  initialError: '',
  initialConfirmed: false,
  showAI: false,
  decision: '',
  attempts: [],
  finalDiagnosis: '',
  finalDiagnosisDraft: '',
  alternativeSuggestion: '',
  finalError: '',
  finalDiagnosisConfirmed: false,
  finalDiagnosisEditing: false,
  decisionReason: '',
  decisionReasonDraft: '',
  rationaleEditing: false,
  reasonConfirmed: false
})

function normaliseDiagnosis(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[()[\],]/g, '')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
}

function getCanonicalDiagnosis(value) {
  const cleaned = normaliseDiagnosis(value)

  return validDiagnoses.find(diagnosis =>
    diagnosis.aliases.some(alias => normaliseDiagnosis(alias) === cleaned) ||
    normaliseDiagnosis(diagnosis.label) === cleaned
  )?.label || ''
}

function resolveDiagnosis(value) {
  return getCanonicalDiagnosis(value) || value.trim()
}

function findDiagnosisSuggestion(value) {
  if (getCanonicalDiagnosis(value)) return ''

  const cleaned = normaliseDiagnosis(value)
  const suggestion = diagnosisSuggestions[cleaned] || ''

  if (!suggestion || normaliseDiagnosis(suggestion) === cleaned) {
    return ''
  }

  return suggestion
}

function isIncompleteDiagnosis(value) {
  const cleaned = normaliseDiagnosis(value)
  return cleaned.length < 3 || incompleteDiagnosisEntries.includes(cleaned)
}

function App() {
  const [caseType, setCaseType] = useState('correct')
  const [caseWork, setCaseWork] = useState({
    correct: createEmptyCaseState(),
    incorrect: createEmptyCaseState()
  })
  const [confirmationAction, setConfirmationAction] = useState('')
  const [summaryOpen, setSummaryOpen] = useState(false)

  const selectedCase = cases[caseType]
  const work = caseWork[caseType]
  const currentAttemptNumber = work.attempts.length + 1

  const diagnosisDraftUnchanged =
    normaliseDiagnosis(work.finalDiagnosisDraft) ===
    normaliseDiagnosis(work.finalDiagnosis)

  function updateCurrentCase(patch) {
    setCaseWork(previous => ({
      ...previous,
      [caseType]: {
        ...previous[caseType],
        ...patch
      }
    }))
  }

  function switchCase(nextCase) {
    setCaseType(nextCase)
    setSummaryOpen(false)
    setConfirmationAction('')
  }

  function updateInitialDiagnosis(value) {
    updateCurrentCase({
      initialDiagnosis: value,
      initialSuggestion: findDiagnosisSuggestion(value),
      initialError: ''
    })
  }

  function acceptInitialSuggestion() {
    updateCurrentCase({
      initialDiagnosis: work.initialSuggestion,
      initialSuggestion: '',
      initialError: ''
    })
  }

  function dismissInitialSuggestion() {
    updateCurrentCase({
      initialSuggestion: '',
      initialError: ''
    })
  }

  function submitInitialDiagnosis() {
    const diagnosis = work.initialDiagnosis.trim()

    if (!diagnosis) {
      updateCurrentCase({ initialError: 'Please enter your initial diagnosis.' })
      return
    }

    if (isIncompleteDiagnosis(diagnosis)) {
      updateCurrentCase({
        initialError: 'This entry appears incomplete. Please enter a complete diagnosis.'
      })
      return
    }

    if (work.initialSuggestion) return

    updateCurrentCase({
      initialDiagnosis: resolveDiagnosis(diagnosis),
      initialError: ''
    })

    setConfirmationAction('confirm-initial')
  }

  function createAttemptSnapshot() {
    return {
      attemptNumber: currentAttemptNumber,
      decision: work.decision,
      initialDiagnosis: work.initialDiagnosis,
      aiRecommendation: selectedCase.diagnosis,
      aiSummary: selectedCase.recommendationSummary,
      diagnosis: work.finalDiagnosis,
      rationale: work.decisionReason,
      completed: work.reasonConfirmed
    }
  }

  function requestDecision(action) {
    const requestedDecision = action === 'accept' ? 'Accepted' : 'Rejected'

    if (
      work.reasonConfirmed ||
      work.finalDiagnosisEditing ||
      work.rationaleEditing
    ) return

    if (work.decision === requestedDecision) {
      setConfirmationAction('same-decision')
      return
    }

    if (work.decision && work.decision !== requestedDecision) {
      setConfirmationAction(action === 'accept' ? 'change-to-accept' : 'change-to-reject')
      return
    }

    const previousAttempt = work.attempts[work.attempts.length - 1]

    if (previousAttempt?.decision === requestedDecision) {
      setConfirmationAction(action === 'accept' ? 'repeat-accept' : 'repeat-reject')
      return
    }

    setConfirmationAction(action)
  }

  function requestNewCase() {
    setConfirmationAction('new-case')
  }

  function requestReopen() {
    if (
      !work.reasonConfirmed ||
      work.finalDiagnosisEditing ||
      work.rationaleEditing ||
      confirmationAction === 'reopen'
    ) return

    setSummaryOpen(false)
    setConfirmationAction('reopen')
  }

  function confirmAction() {
    if (confirmationAction === 'confirm-initial') {
      updateCurrentCase({
        initialConfirmed: true,
        showAI: true,
        initialError: ''
      })
    }

    if (
      confirmationAction === 'accept' ||
      confirmationAction === 'change-to-accept' ||
      confirmationAction === 'repeat-accept'
    ) {
      updateCurrentCase({
        decision: 'Accepted',
        finalDiagnosis: selectedCase.diagnosis,
        finalDiagnosisDraft: selectedCase.diagnosis,
        alternativeSuggestion: '',
        finalError: '',
        finalDiagnosisConfirmed: true,
        finalDiagnosisEditing: false,
        decisionReason: '',
        decisionReasonDraft: '',
        rationaleEditing: false,
        reasonConfirmed: false
      })
    }

    if (
      confirmationAction === 'reject' ||
      confirmationAction === 'change-to-reject' ||
      confirmationAction === 'repeat-reject'
    ) {
      updateCurrentCase({
        decision: 'Rejected',
        finalDiagnosis: '',
        finalDiagnosisDraft: '',
        alternativeSuggestion: '',
        finalError: '',
        finalDiagnosisConfirmed: false,
        finalDiagnosisEditing: false,
        decisionReason: '',
        decisionReasonDraft: '',
        rationaleEditing: false,
        reasonConfirmed: false
      })
    }

    if (confirmationAction === 'confirm-final') {
      updateCurrentCase({
        finalDiagnosisConfirmed: true,
        finalDiagnosisEditing: false,
        finalError: '',
        decisionReason: '',
        decisionReasonDraft: '',
        rationaleEditing: false,
        reasonConfirmed: false
      })
    }

    if (confirmationAction === 'confirm-rationale') {
      if (!work.decisionReasonDraft.trim() || !work.finalDiagnosisConfirmed) {
        setConfirmationAction('')
        return
      }

      updateCurrentCase({
        decisionReason: work.decisionReasonDraft.trim(),
        reasonConfirmed: true,
        rationaleEditing: false
      })
      setSummaryOpen(false)
    }

    if (confirmationAction === 'confirm-rationale-edit') {
      if (
        !work.decisionReasonDraft.trim() ||
        !work.reasonConfirmed ||
        (work.finalDiagnosisEditing && !diagnosisDraftUnchanged)
      ) {
        setConfirmationAction('')
        return
      }

      updateCurrentCase({
        decisionReason: work.decisionReasonDraft.trim(),
        reasonConfirmed: true,
        rationaleEditing: false
      })
    }

    if (confirmationAction === 'reopen') {
      if (!work.reasonConfirmed) {
        setConfirmationAction('')
        return
      }

      updateCurrentCase({
        attempts: [...work.attempts, createAttemptSnapshot()],
        decision: '',
        finalDiagnosis: '',
        finalDiagnosisDraft: '',
        alternativeSuggestion: '',
        finalError: '',
        finalDiagnosisConfirmed: false,
        finalDiagnosisEditing: false,
        decisionReason: '',
        decisionReasonDraft: '',
        rationaleEditing: false,
        reasonConfirmed: false
      })

      setSummaryOpen(false)
    }

    if (confirmationAction === 'new-case') {
      setCaseWork({
        correct: createEmptyCaseState(),
        incorrect: createEmptyCaseState()
      })

      setCaseType('correct')
      setSummaryOpen(false)
    }

    setConfirmationAction('')
  }

  function updateFinalDiagnosis(value) {
    if (work.finalDiagnosisEditing) {
      updateCurrentCase({
        finalDiagnosisDraft: value,
        alternativeSuggestion: findDiagnosisSuggestion(value),
        finalError: ''
      })
      return
    }

    updateCurrentCase({
      finalDiagnosis: value,
      alternativeSuggestion: findDiagnosisSuggestion(value),
      finalError: '',
      finalDiagnosisConfirmed: false,
      decisionReason: '',
      decisionReasonDraft: '',
      rationaleEditing: false,
      reasonConfirmed: false
    })
  }

  function acceptAlternativeSuggestion() {
    if (work.finalDiagnosisEditing) {
      updateCurrentCase({
        finalDiagnosisDraft: work.alternativeSuggestion,
        alternativeSuggestion: '',
        finalError: ''
      })
      return
    }

    updateCurrentCase({
      finalDiagnosis: work.alternativeSuggestion,
      alternativeSuggestion: '',
      finalError: ''
    })
  }

  function dismissAlternativeSuggestion() {
    updateCurrentCase({
      alternativeSuggestion: '',
      finalError: ''
    })
  }

  function validateFinalDiagnosis(value = work.finalDiagnosis) {
    const diagnosis = value.trim()

    if (!diagnosis) {
      updateCurrentCase({ finalError: 'Please enter your final diagnosis.' })
      return ''
    }

    if (isIncompleteDiagnosis(diagnosis)) {
      updateCurrentCase({
        finalError: 'This entry appears incomplete. Please enter a complete diagnosis.'
      })
      return ''
    }

    if (work.alternativeSuggestion) return ''

    return resolveDiagnosis(diagnosis)
  }

  function matchesRejectedAIRecommendation(value) {
    return (
      work.decision === 'Rejected' &&
      normaliseDiagnosis(resolveDiagnosis(value)) ===
        normaliseDiagnosis(selectedCase.diagnosis)
    )
  }

  function confirmFinalDiagnosis() {
    const diagnosis = validateFinalDiagnosis()

    if (!diagnosis) return

    updateCurrentCase({
      finalDiagnosis: diagnosis,
      finalDiagnosisDraft: diagnosis,
      finalError: ''
    })

    if (matchesRejectedAIRecommendation(diagnosis)) {
      setConfirmationAction('rejected-ai-match')
      return
    }

    setConfirmationAction('confirm-final')
  }

  function editFinalDiagnosis() {
    if (
      work.decision !== 'Rejected' ||
      work.rationaleEditing ||
      work.finalDiagnosisEditing
    ) return

    updateCurrentCase({
      finalDiagnosisDraft: work.finalDiagnosis,
      finalDiagnosisEditing: true,
      finalError: '',
      alternativeSuggestion: ''
    })
  }

  function saveEditedFinalDiagnosis() {
    if (!work.finalDiagnosisEditing || work.rationaleEditing) return

    const diagnosis = validateFinalDiagnosis(work.finalDiagnosisDraft)

    if (!diagnosis) return

    const unchanged =
      normaliseDiagnosis(diagnosis) ===
      normaliseDiagnosis(work.finalDiagnosis)

    if (unchanged) {
      updateCurrentCase({
        finalDiagnosisDraft: work.finalDiagnosis,
        finalDiagnosisEditing: false,
        finalError: '',
        alternativeSuggestion: ''
      })
      return
    }

    updateCurrentCase({
      finalDiagnosisDraft: diagnosis,
      finalError: ''
    })

    if (matchesRejectedAIRecommendation(diagnosis)) {
      setConfirmationAction('rejected-ai-match')
      return
    }

    setConfirmationAction('confirm-final-edit')
  }

  function cancelFinalEditing() {
    if (work.rationaleEditing) return

    updateCurrentCase({
      finalDiagnosisDraft: work.finalDiagnosis,
      finalDiagnosisEditing: false,
      finalError: '',
      alternativeSuggestion: ''
    })

    setConfirmationAction('')
  }

  function updateDecisionReason(value) {
    updateCurrentCase({
      decisionReasonDraft: value
    })
  }

  function requestRationaleConfirmation() {
    if (!work.decisionReasonDraft.trim() || !work.finalDiagnosisConfirmed) return
    setConfirmationAction('confirm-rationale')
  }

  function editDecisionRationale() {
    if (
      !work.reasonConfirmed ||
      work.rationaleEditing ||
      (work.finalDiagnosisEditing && !diagnosisDraftUnchanged)
    ) return

    updateCurrentCase({
      decisionReasonDraft: work.decisionReason,
      rationaleEditing: true
    })
  }

  function requestRationaleUpdate() {
    if (
      !work.decisionReasonDraft.trim() ||
      !work.rationaleEditing ||
      (work.finalDiagnosisEditing && !diagnosisDraftUnchanged)
    ) return

    setConfirmationAction('confirm-rationale-edit')
  }

  function cancelRationaleEditing() {
    updateCurrentCase({
      decisionReasonDraft: work.decisionReason,
      rationaleEditing: false
    })

    setConfirmationAction('')
  }

  const comparisonMatches =
    normaliseDiagnosis(resolveDiagnosis(work.initialDiagnosis)) ===
    normaliseDiagnosis(selectedCase.diagnosis)

  const currentAttempt = work.reasonConfirmed
    ? createAttemptSnapshot()
    : null

  const completedAttempts = currentAttempt
    ? [...work.attempts, currentAttempt]
    : work.attempts

  const latestCompletedAttempt =
    completedAttempts.length > 0
      ? completedAttempts[completedAttempts.length - 1]
      : null

  const previousAttempts = work.attempts

  const modalContent = {
    'confirm-initial': {
      title: 'Confirm Initial Diagnosis',
      message: `You entered "${work.initialDiagnosis}". Are you sure you want to use this as your initial diagnosis?`,
      confirm: 'Confirm Diagnosis'
    },
    'confirm-final': {
      title: 'Confirm Final Diagnosis',
      message: `You entered "${work.finalDiagnosis}". Are you sure you want to use this as your final diagnosis?`,
      confirm: 'Confirm Diagnosis'
    },
    'confirm-final-edit': {
      title: 'Update Final Diagnosis and Rationale',
      message: `You are changing your final diagnosis to "${work.finalDiagnosisDraft}". Your previous completed decision, including its rationale, will be saved in Previous Attempts. The previous rationale cannot be reused for the new diagnosis. You MUST provide and confirm a new decision rationale before your updated decision can be completed. Do you want to continue?`,
      confirm: 'Update Diagnosis'
    },
    'rejected-ai-match': {
      title: 'Previously Rejected AI Recommendation',
      message: `Your final diagnosis matches the AI recommendation "${selectedCase.diagnosis}", which you previously rejected. You can still use this diagnosis if it reflects your final clinical judgement. Are you sure you want to continue?`,
      confirm: 'Use This Diagnosis'
    },
    accept: {
      title: 'Confirm Your Decision',
      message: 'Are you sure you want to accept the AI recommendation?',
      confirm: 'Confirm'
    },
    reject: {
      title: 'Confirm Your Decision',
      message: 'Are you sure you want to reject the AI recommendation?',
      confirm: 'Confirm'
    },
    'change-to-accept': {
      title: 'Change Your Decision?',
      message: `You selected Reject for Attempt ${currentAttemptNumber}. Changing to Accept will replace your current Final Diagnosis and clear any unfinished rationale. Are you sure you want to continue?`,
      confirm: 'Change to Accept'
    },
    'change-to-reject': {
      title: 'Change Your Decision?',
      message: `You selected Accept for Attempt ${currentAttemptNumber}. Changing to Reject will clear your current Final Diagnosis and any unfinished rationale. Are you sure you want to continue?`,
      confirm: 'Change to Reject'
    },
    'same-decision': {
      title: 'Decision Already Selected',
      message: `You have already selected ${work.decision} for Attempt ${currentAttemptNumber}. Your current decision has not been changed.`,
      confirm: 'Got it'
    },
    'repeat-accept': {
      title: 'Previous Decision Reminder',
      message: `You also accepted the AI recommendation in Attempt ${work.attempts[work.attempts.length - 1]?.attemptNumber}. Are you sure you want to accept it again for Attempt ${currentAttemptNumber}?`,
      confirm: 'Accept Again'
    },
    'repeat-reject': {
      title: 'Previous Decision Reminder',
      message: `You also rejected the AI recommendation in Attempt ${work.attempts[work.attempts.length - 1]?.attemptNumber}. Are you sure you want to reject it again for Attempt ${currentAttemptNumber}?`,
      confirm: 'Reject Again'
    },
    'confirm-rationale': {
      title: 'Confirm Your Rationale',
      message: 'Are you sure you want to submit this decision and rationale?',
      confirm: 'Confirm'
    },
    'confirm-rationale-edit': {
      title: 'Update Decision Rationale',
      message: 'Are you sure you want to update your decision rationale? Your previous rationale will be replaced.',
      confirm: 'Update Rationale'
    },
    reopen: {
      title: 'Change My Decision?',
      message: `Reopen the decision process to reconsider your response to the AI recommendation. Your completed decision for Attempt ${currentAttemptNumber} will be saved as a previous attempt. You can then make a new decision as Attempt ${currentAttemptNumber + 1}.`,
      confirm: 'Change My Decision'
    },
    'new-case': {
      title: 'Start a New Case?',
      message: 'Starting a new case will clear all current progress and decision history from both scenarios. Are you sure you want to start again?',
      confirm: 'Start New Case'
    }
  }

  function handleModalConfirm() {
    if (confirmationAction === 'rejected-ai-match') {
      if (work.finalDiagnosisEditing) {
        setConfirmationAction('confirm-final-edit')
      } else {
        setConfirmationAction('confirm-final')
      }
      return
    }

    if (confirmationAction === 'confirm-final-edit') {
      const updatedAttempts = work.reasonConfirmed
        ? [...work.attempts, createAttemptSnapshot()]
        : work.attempts

      updateCurrentCase({
        attempts: updatedAttempts,
        finalDiagnosis: work.finalDiagnosisDraft,
        finalDiagnosisDraft: work.finalDiagnosisDraft,
        finalDiagnosisConfirmed: true,
        finalDiagnosisEditing: false,
        finalError: '',
        alternativeSuggestion: '',
        decisionReason: '',
        decisionReasonDraft: '',
        rationaleEditing: false,
        reasonConfirmed: false
      })

      setSummaryOpen(false)
      setConfirmationAction('')
      return
    }

    confirmAction()
  }

  return (
    <main className="app-container">
      <header className="app-header">
        <div>
          <p className="eyebrow">Human-Centred Clinical Decision Support</p>
          <h1>ClinicianAI</h1>
          <p className="app-subtitle">
            Explore an AI recommendation, evaluate the available evidence, and make your own clinical decision.
          </p>
        </div>
      </header>

      <section className="case-card">
        <div className="section-heading">
          <div>
            <p className="step-label">CASE OVERVIEW</p>
            <h2>{selectedCase.title}</h2>
          </div>
          <span className="case-id">Case {selectedCase.id}</span>
        </div>

        <div className="case-selector">
          <label htmlFor="case-select">Select Clinical Scenario</label>
          <select
            id="case-select"
            value={caseType}
            onChange={event => switchCase(event.target.value)}
          >
            <option value="correct">Case 001 — Scenario A</option>
            <option value="incorrect">Case 002 — Scenario B</option>
          </select>
          <p className="helper-text case-preservation-note">
            Your progress is kept separately for each case during this session. Switching cases will not clear your work.
          </p>
        </div>

        <div className="patient-details">
          <span className="detail-label">Patient</span>
          <strong>{selectedCase.patient}</strong>
        </div>

        <div className="findings-section">
          <h3>Clinical Findings</h3>
          <ul className="findings-list">
            {selectedCase.findings.map(finding => (
              <li key={finding}>{finding}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="decision-card">
        <div className="section-heading">
          <div>
            <p className="step-label">STEP 1</p>
            <h2>Enter Your Initial Diagnosis</h2>
          </div>
        </div>

        <p className="section-description">
          Record your initial assessment before viewing the AI recommendation.
        </p>

        {!work.initialConfirmed ? (
          <>
            <label htmlFor="initial-diagnosis">Your Initial Diagnosis</label>
            <input
              id="initial-diagnosis"
              type="text"
              value={work.initialDiagnosis}
              onChange={event => updateInitialDiagnosis(event.target.value)}
              placeholder="Enter your diagnosis..."
            />

            {work.initialSuggestion && (
              <div className="suggestion-panel">
                <p className="suggestion-title">Did you mean?</p>
                <p><strong>Your entry:</strong> {work.initialDiagnosis}</p>
                <p><strong>Suggested diagnosis:</strong> {work.initialSuggestion}</p>
                <div className="suggestion-actions">
                  <button type="button" className="primary-button small-button" onClick={acceptInitialSuggestion}>
                    Yes, Use This
                  </button>
                  <button type="button" className="secondary-button small-button" onClick={dismissInitialSuggestion}>
                    No, Keep My Entry
                  </button>
                </div>
              </div>
            )}

            {work.initialError && <p className="error-message">{work.initialError}</p>}

            <p className="helper-text">
              You can enter a diagnosis in your own words. The prototype checks for blank or obviously incomplete entries, but does not verify clinical validity.
            </p>

            <div className="form-actions">
              <button
                type="button"
                className="primary-button"
                onClick={submitInitialDiagnosis}
                disabled={!work.initialDiagnosis.trim() || Boolean(work.initialSuggestion)}
              >
                Submit Initial Diagnosis
              </button>
            </div>
          </>
        ) : (
          <p className="locked-entry">
            <strong>Your initial diagnosis:</strong> {work.initialDiagnosis}
          </p>
        )}
      </section>

      {work.showAI && (
        <>
          <section className="decision-card">
            <div className="section-heading">
              <div>
                <p className="step-label">STEP 2</p>
                <h2>Evaluate the AI Recommendation</h2>
              </div>
            </div>

            <div className="recommendation-panel">
              <div className="recommendation-heading">
                <div>
                  <p className="detail-label">AI RECOMMENDATION</p>
                  <h3>{selectedCase.diagnosis}</h3>
                </div>
                <div className="confidence-display">
                  <strong>{selectedCase.confidence}%</strong>
                  <span>Simulated Confidence</span>
                </div>
              </div>

              <div className="simulation-notice">
                <div className="simulation-notice-heading">
                  <span className="simulation-icon">!</span>
                  <strong>Simulated AI Output</strong>
                </div>
                <p>
                  This prototype uses predefined case recommendations and explanations. It does not connect to a live AI model or provide clinical advice.
                </p>
              </div>
            </div>

            <div className="comparison-section">
              <h3>Initial Diagnosis Comparison</h3>
              <div className="comparison-layout">
                <div className="comparison-column">
                  <span className="detail-label">YOUR INITIAL DIAGNOSIS</span>
                  <strong>{work.initialDiagnosis}</strong>
                </div>
                <div className={`comparison-result ${comparisonMatches ? 'match' : 'different'}`}>
                  <span className="comparison-symbol">{comparisonMatches ? '=' : '≠'}</span>
                  <strong>{comparisonMatches ? 'MATCH' : 'DIFFERENT'}</strong>
                  <span>{comparisonMatches ? 'Matching diagnosis' : 'Different diagnosis'}</span>
                </div>
                <div className="comparison-column">
                  <span className="detail-label">AI RECOMMENDATION</span>
                  <strong>{selectedCase.diagnosis}</strong>
                </div>
              </div>
              <p className="helper-text">
                This comparison checks whether the diagnoses match based on their wording. It does not indicate clinical correctness.
              </p>
            </div>

            <div className="contrastive-section">
              <h3>
                Contrastive Explanation — Why this diagnosis rather than {selectedCase.alternative}?
              </h3>
              <p className="section-description">
                Compare the findings supporting the AI recommendation with those that may support the alternative diagnosis.
              </p>
              <div className="contrastive-columns">
                <div className="contrastive-column">
                  <h4>Why the AI recommends {selectedCase.diagnosis}</h4>
                  <ul>
                    {selectedCase.explanation.map((item, index) => (
                      <li key={`explanation-${index}`}>{item}</li>
                    ))}
                    {selectedCase.contrastiveExplanation.map((item, index) => (
                      <li key={`support-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="contrastive-column alternative-column">
                  <h4>Why not {selectedCase.alternative}?</h4>
                  <ul>
                    {selectedCase.alternativeExplanation.map((item, index) => (
                      <li key={`alternative-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="explanation-disclaimer">
                These are predefined explanations written for the simulated case. They do not represent the internal reasoning of a live AI model.
              </p>
            </div>

            <div className="clinical-notice">
              <strong>Clinical Review Reminder</strong>
              <p>{selectedCase.warning}</p>
            </div>
          </section>

          <section className="decision-card">
            <div className="section-heading">
              <div>
                <p className="step-label">STEP 3</p>
                <h2>Make Your Decision</h2>
              </div>
            </div>

            <p className="section-description">
              Review the available information and decide whether to accept or reject the AI recommendation.
            </p>

            <div className="decision-buttons">
              <button
                type="button"
                className="accept-button"
                onClick={() => requestDecision('accept')}
                disabled={work.reasonConfirmed || work.rationaleEditing || work.finalDiagnosisEditing}
              >
                Accept Recommendation
              </button>
              <button
                type="button"
                className="reject-button"
                onClick={() => requestDecision('reject')}
                disabled={work.reasonConfirmed || work.rationaleEditing || work.finalDiagnosisEditing}
              >
                Reject Recommendation
              </button>
            </div>

            {work.decision && (
              <div className={`decision-status ${work.decision === 'Accepted' ? 'accepted' : 'rejected'}`}>
                <strong>Clinician's Decision: {work.decision} AI Recommendation</strong>
                <p>
                  {work.decision === 'Accepted'
                    ? 'You have chosen to accept the AI recommendation.'
                    : 'You have chosen to reject the AI recommendation.'}
                </p>
              </div>
            )}

            {work.decision && (
              <div className="final-diagnosis-section">
                <h3>Final Diagnosis</h3>

                {!work.finalDiagnosisConfirmed || work.finalDiagnosisEditing ? (
                  <>
                    <label htmlFor="final-diagnosis">Your Final Diagnosis</label>
                    <input
                      id="final-diagnosis"
                      type="text"
                      value={work.finalDiagnosisEditing ? work.finalDiagnosisDraft : work.finalDiagnosis}
                      onChange={event => updateFinalDiagnosis(event.target.value)}
                      placeholder="Enter your final diagnosis..."
                      disabled={work.rationaleEditing}
                    />

                    {work.alternativeSuggestion && (
                      <div className="suggestion-panel">
                        <p className="suggestion-title">Did you mean?</p>
                        <p><strong>Your entry:</strong> {work.finalDiagnosisEditing ? work.finalDiagnosisDraft : work.finalDiagnosis}</p>
                        <p><strong>Suggested diagnosis:</strong> {work.alternativeSuggestion}</p>
                        <div className="suggestion-actions">
                          <button type="button" className="primary-button small-button" onClick={acceptAlternativeSuggestion} disabled={work.rationaleEditing}>
                            Yes, Use This
                          </button>
                          <button type="button" className="secondary-button small-button" onClick={dismissAlternativeSuggestion} disabled={work.rationaleEditing}>
                            No, Keep My Entry
                          </button>
                        </div>
                      </div>
                    )}

                    {work.finalError && <p className="error-message">{work.finalError}</p>}

                    <p className="helper-text">
                      You can enter a diagnosis in your own words. The prototype checks for blank or obviously incomplete entries, but does not verify clinical validity.
                    </p>

                    <div className="form-actions">
                      <button
                        type="button"
                        className="primary-button"
                        onClick={
                          work.finalDiagnosisEditing
                            ? saveEditedFinalDiagnosis
                            : confirmFinalDiagnosis
                        }
                        disabled={
                          work.rationaleEditing ||
                          !(work.finalDiagnosisEditing ? work.finalDiagnosisDraft : work.finalDiagnosis).trim() ||
                          Boolean(work.alternativeSuggestion)
                        }
                      >
                        {work.finalDiagnosisEditing ? 'Save Updated Diagnosis' : 'Confirm Final Diagnosis'}
                      </button>

                      {work.finalDiagnosisEditing && (
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={cancelFinalEditing}
                          disabled={work.rationaleEditing}
                        >
                          Cancel Editing
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="confirmed-message">
                      <span>✓</span> {work.finalDiagnosis}
                    </p>
                    {work.decision === 'Rejected' ? (
                      <button
                        type="button"
                        className="secondary-button edit-button"
                        onClick={editFinalDiagnosis}
                        disabled={work.rationaleEditing}
                      >
                        Edit Final Diagnosis
                      </button>
                    ) : (
                      <p className="helper-text">
                        Your final diagnosis reflects the accepted AI recommendation.
                        To select a different diagnosis, choose Reject Recommendation
                        before completing your decision, or use Change My Decision
                        after completing it.
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            {work.decision && work.finalDiagnosisConfirmed && (
              <div className="rationale-section">
                <h3>Decision Rationale</h3>
                <p className="section-description">
                  Explain why you accepted or rejected the recommendation, referring to the case information where appropriate.
                </p>

                {work.finalDiagnosisEditing && !diagnosisDraftUnchanged ? (
                  <div className="rationale-link-notice">
                    Your current rationale is linked to "{work.finalDiagnosis}". Save the changed final diagnosis to provide a new rationale for it.
                  </div>
                ) : work.reasonConfirmed && !work.rationaleEditing ? (
                  <>
                    <div className="final-rationale">
                      <span className="detail-label">YOUR CONFIRMED RATIONALE</span>
                      <p>{work.decisionReason}</p>
                    </div>
                    <button
                      type="button"
                      className="secondary-button edit-button"
                      onClick={editDecisionRationale}
                      disabled={work.finalDiagnosisEditing && !diagnosisDraftUnchanged}
                    >
                      Edit Decision Rationale
                    </button>
                  </>
                ) : (
                  <>
                    <label htmlFor="decision-reason">Your Rationale</label>
                    <textarea
                      id="decision-reason"
                      rows="4"
                      value={work.decisionReasonDraft}
                      onChange={event => updateDecisionReason(event.target.value)}
                      placeholder="Explain the reasoning behind your decision..."
                    />

                    <div className="form-actions">
                      {work.rationaleEditing ? (
                        <>
                          <button
                            type="button"
                            className="primary-button"
                            onClick={requestRationaleUpdate}
                            disabled={
                              !work.decisionReasonDraft.trim() ||
                              (work.finalDiagnosisEditing && !diagnosisDraftUnchanged)
                            }
                          >
                            Update Decision Rationale
                          </button>
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={cancelRationaleEditing}
                          >
                            Cancel Editing
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="primary-button"
                          onClick={requestRationaleConfirmation}
                          disabled={!work.decisionReasonDraft.trim()}
                        >
                          Confirm Decision Rationale
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </section>
        </>
      )}

      {latestCompletedAttempt && (
        <section className="final-decision-card">
          <div className="final-decision-heading">
            <div>
              <p className="step-label">
                {work.reasonConfirmed ? 'FINAL DECISION' : 'LAST COMPLETED DECISION'}
              </p>
              <h2>Decision Summary</h2>
              <p className="attempt-reference">
                Attempt {latestCompletedAttempt.attemptNumber}
              </p>
            </div>
            <span className="completed-label">Completed</span>
          </div>

          <div className="final-decision-details">
            <div>
              <span className="detail-label">FINAL DIAGNOSIS</span>
              <strong>{latestCompletedAttempt.diagnosis}</strong>
            </div>

            <div className="final-rationale">
              <span className="detail-label">DECISION RATIONALE</span>
              <p>{latestCompletedAttempt.rationale}</p>
            </div>

            <div>
              <span className="detail-label">INITIAL DIAGNOSIS</span>
              <strong>{latestCompletedAttempt.initialDiagnosis}</strong>
            </div>

            <div>
              <span className="detail-label">AI RECOMMENDATION</span>
              <strong>{latestCompletedAttempt.aiRecommendation}</strong>
              <span className={`decision-outcome ${latestCompletedAttempt.decision === 'Accepted' ? 'accepted' : 'rejected'}`}>
                {latestCompletedAttempt.decision}
              </span>
              <p className="ai-summary">{latestCompletedAttempt.aiSummary}</p>
            </div>
          </div>
        </section>
      )}

      {previousAttempts.length > 0 && (
        <section className="decision-summary-section">
          <button
            type="button"
            className="summary-toggle"
            onClick={() => setSummaryOpen(open => !open)}
            aria-expanded={summaryOpen}
          >
            <span>
              <strong>Previous Attempts</strong>
              <small>{previousAttempts.length} saved</small>
            </span>
            <span className="summary-toggle-action">
              {summaryOpen ? 'Hide Previous Attempts' : 'View Previous Attempts'}
              <span className={`summary-chevron ${summaryOpen ? 'open' : ''}`}>⌄</span>
            </span>
          </button>

          {summaryOpen && (
            <div className="summary-content">
              {previousAttempts.map(attempt => (
                <article className="history-item" key={attempt.attemptNumber}>
                  <div className="history-item-heading">
                    <strong>Attempt {attempt.attemptNumber}</strong>
                    <span className="history-complete">Completed</span>
                  </div>
                  <p><strong>Initial diagnosis:</strong> {attempt.initialDiagnosis || 'Not recorded'}</p>
                  <div className="history-ai-recommendation">
                    <p><strong>AI recommendation:</strong> {attempt.aiRecommendation || 'Not recorded'}</p>
                    <span className={`decision-outcome ${attempt.decision === 'Accepted' ? 'accepted' : 'rejected'}`}>
                      {attempt.decision || 'Not recorded'}
                    </span>
                    <p className="ai-summary">{attempt.aiSummary}</p>
                  </div>
                  <p><strong>Final diagnosis:</strong> {attempt.diagnosis || 'Not confirmed'}</p>
                  <p><strong>Rationale:</strong> {attempt.rationale || 'Not provided'}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      <div className="bottom-action-row">
        <button
          type="button"
          className="secondary-button"
          onClick={requestReopen}
          disabled={
            !work.reasonConfirmed ||
            work.finalDiagnosisEditing ||
            work.rationaleEditing ||
            confirmationAction === 'reopen'
          }
        >
          Change My Decision
        </button>
        <button
          type="button"
          className="secondary-button new-case-button"
          onClick={requestNewCase}
        >
          Start New Case
        </button>
      </div>

      {confirmationAction && modalContent[confirmationAction] && (
        <div className="modal-overlay">
          <section
            className="confirmation-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-message"
          >
            <h2 id="modal-title">{modalContent[confirmationAction].title}</h2>
            <p id="modal-message">{modalContent[confirmationAction].message}</p>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setConfirmationAction('')}
              >
                {confirmationAction === 'same-decision'
                  ? 'Close'
                  : confirmationAction === 'rejected-ai-match'
                    ? 'Go Back'
                    : 'Cancel'}
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={handleModalConfirm}
              >
                {modalContent[confirmationAction].confirm}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}

export default App
