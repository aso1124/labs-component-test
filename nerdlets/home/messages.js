import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { SectionMessage, UserStorageQuery, UserStorageMutation } from 'nr1';
import dayjs from 'dayjs';

const COLLECTION_ID = 'USER_MSGS_CONFIG';
const DOCUMENT_ID = 'dismissed';
const getMessageId = msg => msg.date.concat(msg.desc);
const getMessageType = msg => {
  switch (msg.level) {
    case 'critical':
      return SectionMessage.TYPE.CRITICAL;
    case 'warning':
      return SectionMessage.TYPE.WARNING;
    default:
      return SectionMessage.TYPE.INFO;
  }
};
const getMessageActions = (msg, dismissMessage) => {
  const actions = [];
  msg.link && actions.push({ ...msg.link });
  actions.push({ label: 'Dismiss', onClick: dismissMessage });
};

const Messages = ({
  org,
  repo,
  branch,
  directory,
  fileName,
  timeoutPeriod,
}) => {
  const [messages, setMessages] = useState();
  const [config, setConfig] = useState();

  useEffect(() => {
    const loadConfig = async () => {
      const document = await UserStorageQuery.query({
        collection: COLLECTION_ID,
        documentId: DOCUMENT_ID,
      });
      const cfg = document?.data || {};
      setConfig(cfg);
      return cfg;
    };

    const loadMessages = async () => {
      const response = await fetch(
        `https://raw.githubusercontent.com/${org}/${repo}/${branch}/${directory &&
          directory.concat('/')}${fileName}.json`
      );
      const msgs = await response;
      console.info(msgs)
      return msgs;
    };

    const filterMessages = (cfg, msgs) => {
      const filteredMessages = msgs
        .filter(m => m.date && m.desc) // remove messages missing required attributes
        .filter(m => dayjs().diff(dayjs(m.date)) < timeoutPeriod) // remove old messages
        .filter(m => {
          const dismissed = cfg?.dismissed || [];
          for (let z = 0; z < dismissed.length; z++) {
            if (getMessageId(m) === dismissed[z]) {
              return false;
            }
          }
          return true;
        }); // remove messages previously dismissed by the user
      setMessages(filteredMessages);
    };

    loadConfig()
      .then(cfg => loadMessages().then(msgs => filterMessages(cfg, msgs)))
      // eslint-disable-next-line no-console
      .catch(e => console.error('error loading messages', e));
  }, []); // end useEffect()

  const dismissMessage = async msg => {
    const id = getMessageId(msg);

    // remove the message from state
    setMessages(existingMessages =>
      existingMessages.filter(m => getMessageId(m) === id)
    );

    // save the message as dismissed for this user
    const dismissed = config || [];
    dismissed.push(id);
    await UserStorageMutation.mutate({
      actionType: UserStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
      collection: COLLECTION_ID,
      documentId: DOCUMENT_ID,
      document: dismissed,
    });
    setConfig(dismissed);
  };

  return (
    <>
      {messages && messages.map((idx, msg) => (
        <SectionMessage
          key={idx}
          type={getMessageType(msg.level)}
          title={msg.title}
          description={msg.desc}
          actions={getMessageActions(msg, dismissMessage)}
        />
      ))}
    </>
  );
};

Messages.propTypes = {
  /* The github organization where the messages file is located. Default is newrelic */
  org: PropTypes.string,
  /* The name of the github repo where the messages file is located */
  repo: PropTypes.string.isRequired,
  /* The github branch where the file is located. Default is main */
  branch: PropTypes.string,
  /* Directory where the file is located. Default is repo root */
  directory: PropTypes.string,
  /* Filename without extension where messages will be found. Default is messages */
  fileName: PropTypes.string,
  /* Age in seconds after which Messages will not be displayed. Default is two weeks */
  timeoutPeriod: PropTypes.number,
};

Messages.defaultProps = {
  org: 'newrelic',
  branch: 'main',
  fileName: 'messages',
  timeoutPeriod: 1210000,
};

export default Messages;
