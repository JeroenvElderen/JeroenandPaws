import React from 'react';

const StyleGuideCodeEmbed = () => (
  <div className="sg_code-embed">
          <div className="sg_code-embed w-embed">
            <style>{`
  .sg-nav-menu-heading.w--current ~ .sg-nav-menu-item {
    display: flex;
  }
  .sg-selector-wrapper:before,
  .sg-selector-wrapper-x:before {
    display: block;
    font-size: 0.75em;
    text-transform: uppercase;
    opacity: 0.6;
    font-weight: 300;
    margin-bottom: 0.35em;
  }
  .sg-selector-wrapper.sg-class:before,
  .sg-selector-wrapper-x.sg-class:before {
    content: 'class';
  }
  .sg-selector-wrapper.sg-variable:before,
  .sg-selector-wrapper-x.sg-variable:before {
    content: 'variable';
  }
  .sg-selector-wrapper.sg-variable .sg-selector,
  .sg-selector-wrapper-x.sg-variable .sg-selector {
    background-color: #f0ebff;
    color: #9e51eb;
  }
  .sg-selector-wrapper.sg-tag:before,
  .sg-selector-wrapper-x.sg-tag:before {
    content: 'tag';
  }
  .sg-selector-wrapper.sg-tag .sg-selector {
    background-color: #FF008A21;
    color: #D10071;
  }
  .sg-selector-wrapper-x.sg-tag .sg-selector {
    color: #D10071;
    background: #FFDEF0;
  }
  .sg-folder::before {
      content: url("data:image/svg+xml,%3Csvg%20data-wf-icon%3D%22FolderOpenIcon%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M2%203C1.44772%203%201%203.44772%201%204V7H2V4H5.29289L7.29289%206H12V5H7.70711L5.70711%203H2Z%22%20fill%3D%22currentColor%22%3E%3C/path%3E%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20d%3D%22M3.83852%207C3.42961%207%203.0619%207.24895%202.91004%207.62861L1.31004%2011.6286C1.04729%2012.2855%201.53105%2013%202.23852%2013H12.1615C12.5704%2013%2012.9381%2012.751%2013.09%2012.3714L14.69%208.37139C14.9527%207.71453%2014.4689%207%2013.7615%207H3.83852ZM3.83852%208L13.7615%208L12.1615%2012H2.23852L3.83852%208Z%22%20fill%3D%22currentColor%22%3E%3C/path%3E%3C/svg%3E");
      display: inline-block;
      vertical-align: middle; /* Optional: Adjust as needed */
      margin-right: 4px; /* Adjust spacing as needed */
      width: 16px;
      height: 16px;
  }
  `}</style>
          </div>
          <div className="events_none w-embed"><svg width="100%" height="100%" viewbox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M2 3C2 2.44772 2.44772 2 3 2H13C13.5523 2 14 2.44772 14 3V13C14 13.5523 13.5523 14 13 14H3C2.44772 14 2 13.5523 2 13V3ZM3 13V3H13V13H3ZM8.26565 4.5H9.29004L7.73458 11.5H6.71018L8.26565 4.5ZM5.20711 8L6.35355 6.85355L5.64645 6.14645L4.14645 7.64645L3.79289 8L4.14645 8.35355L5.64645 9.85355L6.35355 9.14645L5.20711 8ZM10.3536 6.14645L11.8536 7.64645L12.2071 8L11.8536 8.35355L10.3536 9.85355L9.64645 9.14645L10.7929 8L9.64645 6.85355L10.3536 6.14645Z" fill="currentColor"></path>
            </svg></div>
          <div className="w-embed">
            <style>{`
  .antialiased {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  .rich-text p:last-child {
      margin-bottom: 0;
  }
  `}</style>
          </div>
        </div>
);

export default StyleGuideCodeEmbed;