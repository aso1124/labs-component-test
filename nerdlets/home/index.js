import React, { useState, useEffect } from 'react';
import { nerdlet, Icon } from "nr1"
import { HelpModal } from '@newrelic/nr-labs-components';
import Messages from './messages'

const Main = (props) => {
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  useEffect(() => {
    nerdlet.setConfig({
      actionControls: true,
      actionControlButtons: [
        {
          label: "Help",
          hint: "Quick links to get support",
          type: "primary",
          iconType: Icon.TYPE.INTERFACE__INFO__HELP,
          onClick: () => setHelpModalOpen(true),
        },
      ],
    })
  }, [])

  return (
    <>
    <Messages />
    <div>Testing</div>
    {helpModalOpen && (
      <HelpModal
        isModalOpen={helpModalOpen}
        setModalOpen={setHelpModalOpen}
        urls={{
          docs: "https://www.google.com",
          createIssue: "https://www.google.com",
          createFeature: "https://www.google.com",
          createQuestion: "https://www.google.com",
        }}
        ownerBadge={{
          logo: {
            src: "https://drive.google.com/uc?id=1BdXVy2X34rufvG4_1BYb9czhLRlGlgsT",
            alt: 'New Relic Labs'
          },
          blurb: {
            text: "This a New Relic Labs open source app.", 
            link: {
              text: 'Take a look at our other repos',
              url: 'https://github.com/newrelic?q=nrlabs-viz&type=all&language=&sort='
            }
          },
        }}
      />
    )}
    </>
  )
}

export default Main