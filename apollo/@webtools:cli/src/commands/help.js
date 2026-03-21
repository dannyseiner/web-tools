import { RESET, BOLD, DIM, CYAN, ORANGE } from "../logger.js";

const TOKEN_ENV = "NEXT_PUBLIC_WEBTOOLS_PROJECT_TOKEN";

export function help() {
    console.log(`
  ${ORANGE}${BOLD}@uu-webtools/cli${RESET}

  ${BOLD}Usage:${RESET}
    npx @uu-webtools/cli ${CYAN}<command>${RESET}

  ${BOLD}Commands:${RESET}
    ${CYAN}init${RESET}      Set up webtools in your project
    ${CYAN}pull${RESET}      Download translations to messages/{lang}/common.json
    ${CYAN}push${RESET}      Upload local translations to the API
    ${CYAN}status${RESET}    Show project translation status
    ${CYAN}help${RESET}      Show help

  ${BOLD}Environment:${RESET}
    ${TOKEN_ENV}   Your project API token
    ${DIM}Set it in .env.local or export it${RESET}

  ${BOLD}File structure:${RESET}
    ${DIM}messages/
      cs/
        common.json
      en/
        common.json${RESET}
`);
}
