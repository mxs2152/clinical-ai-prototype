
# ClinicianAI

Human-Centred Explainable AI for Clinical Decision Support

Module: Intelligent Interactive Systems (Extended)
Assessment: Assignment 2 – Project Report
Prose word count: 808

## Project Overview

ClinicianAI is an interactive front-end prototype exploring how human-centred interaction design can support critical evaluation of AI-assisted diagnostic recommendations while preserving clinician control.

The prototype addresses overreliance on incorrect recommendations and underreliance on useful recommendations through cognitive forcing, contextual explanations and structured decision-making.

## Project Status

The interactive front-end prototype is implemented and functional. It includes two predefined clinical scenarios with correct and incorrect simulated AI recommendations.

Clinical findings, recommendations, confidence scores and explanations are predefined. No live AI model, backend or external clinical service is connected.

Clinical validation, persistent data storage and formal user evaluation remain outside the current project scope.

## Features

- Two clinical scenarios with independent session-based progress.
- Initial diagnosis confirmation before AI recommendation disclosure.
- Initial diagnosis locking, predefined suggestions and basic input validation.
- Simulated recommendations and illustrative confidence scores.
- Wording-based diagnosis comparison and context-sensitive explanations.
- Equally emphasised Accept and Reject options.
- Final diagnosis confirmation and mandatory decision rationale.
- Decision revision and previous completed attempts.
- Interactive progress navigation and confirmation dialogs.
- Keyboard interaction support and responsive layouts.

## Technology Stack

- React: Interface components and workflow state management.
- JavaScript: Interaction logic, validation and predefined scenario data.
- CSS: Interface styling, visual hierarchy and responsive layouts.
- Vite: Development server and production build.
- ESLint: Static code analysis.
- Git and GitHub: Version control and development history.
- ChatGPT: Development and documentation assistance.

## Running the Prototype

### Requirements

- Node.js
- npm
- A modern web browser

Development environment: Node.js 25.2.1 and npm 11.6.2.

### Installation

Clone the repository:

```bash
git clone https://github.com/mxs2152/clinical-ai-prototype.git
cd clinical-ai-prototype
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in the terminal.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the development server |
| `npm run build` | Creates a production build |
| `npm run preview` | Previews the production build |
| `npm run lint` | Runs ESLint checks |

### Main Implementation Files

| File | Purpose |
|---|---|
| `src/App.jsx` | Scenario data, interface components, validation and workflow logic |
| `src/App.css` | Interface styling, visual feedback and responsive layouts |
| `package.json` | Project dependencies and scripts |

## Interaction Workflow

1. Select a clinical scenario and review the patient findings.
2. Enter and confirm an initial diagnosis before viewing the AI recommendation.
3. Review the simulated recommendation, illustrative confidence score and available explanations.
4. Accept or reject the recommendation.
5. Review the automatically assigned final diagnosis when accepting, or enter and confirm an independent diagnosis when rejecting.
6. Enter and confirm a decision rationale.
7. Review the decision summary, revise the decision or start a new case.

Completed attempts can be reviewed within the current session. Switching scenarios preserves their respective progress, while starting a new case resets both scenarios.

## Development Record

Development progressed from the initial prototype to refinements addressing decision consistency, presentation bias, transparency, interaction control and responsive behaviour.

| Commit | Development change | Reason |
|---|---|---|
| [1fffacc](https://github.com/mxs2152/clinical-ai-prototype/commit/1fffacc) | Initial ClinicianAI prototype | Establish the core interaction workflow and simulated scenarios. |
| [eaae61c](https://github.com/mxs2152/clinical-ai-prototype/commit/eaae61c) | Decision and diagnosis consistency | Prevent contradictions between an accepted recommendation and the final diagnosis. |
| [4e32479](https://github.com/mxs2152/clinical-ai-prototype/commit/4e32479) | Balanced decision buttons | Avoid visually favouring acceptance over rejection. |
| [5f4ebbc](https://github.com/mxs2152/clinical-ai-prototype/commit/5f4ebbc) | Neutral scenario presentation | Avoid prematurely disclosing recommendation correctness. |
| [ddf315b](https://github.com/mxs2152/clinical-ai-prototype/commit/ddf315b) | Illustrative confidence scores | Distinguish predefined scores from calculated probabilities. |
| [0e2f80f](https://github.com/mxs2152/clinical-ai-prototype/commit/0e2f80f) | Workflow, accessibility and responsive refinements | Improve interaction visibility, contextual explanations, input validation, navigation and smaller-screen presentation. |

### Testing and Verification

Manual checks covered:

- Initial diagnosis confirmation and delayed recommendation disclosure.
- Accept and Reject pathways.
- Diagnosis suggestions and input validation.
- Final diagnosis editing and rationale confirmation.
- Decision reopening and previous-attempt history.
- Scenario switching and workflow reset.
- Keyboard interaction with selected confirmation dialogs.
- Responsive layouts using browser device emulation.

The final code revision was checked using:

```bash
npm run lint
npm run build
```

Both commands completed successfully on 25 November 2026.

## AI Assistance

ChatGPT was used to support software development, interaction design, debugging and project documentation.

Generated suggestions were reviewed and adapted to the project's requirements. Examples include balancing the visual emphasis of the Accept and Reject buttons, refining decision-state consistency and improving the responsive layout.

The implementation was checked through manual interaction testing, selected keyboard interaction checks, browser device emulation, ESLint and production builds. The author reviewed the outputs and made the final design and implementation decisions.

## Limitations

- Recommendations, confidence scores and explanations are predefined and simulated.
- Diagnosis validation and comparison rely on limited wording rules rather than clinical reasoning.
- Contrastive explanations are available only for supported predefined diagnosis comparisons.
- Session progress and decision history are lost when the application is refreshed.
- Comprehensive accessibility and cross-browser compliance have not been established.
- No clinical validation or formal user study has been conducted.

The prototype demonstrates interaction design mechanisms intended to support critical evaluation and human control. It does not establish improvements in diagnostic accuracy or trust calibration and is not intended for clinical use.

## Additional Materials

The accompanying Assignment 2 Project Report contains the design rationale, system architecture diagram, interaction storyboards and academic references.

The storyboard screenshots show interactions with the implemented prototype.

## Repository

https://github.com/mxs2152/clinical-ai-prototype
