import type { JSXInternal } from 'preact/src/jsx';

import ExternalLinkIcon from ':virtual/vitebook/icons/external-link?raw';

function OutboundLink(): JSXInternal.Element {
  return (
    <div dangerouslySetInnerHTML={{ __html: ExternalLinkIcon.trim() }}></div>
  );
}

OutboundLink.displayName = 'OutboundLink';

export default OutboundLink;
