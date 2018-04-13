import React from 'react';
import ReactDOM from 'react-dom';

// Note that Froala Editor has to be required separately
import 'froala-editor/js/froala_editor.pkgd.min.js';
import 'froala-editor/css/froala_editor.pkgd.min.css';

// Require Font Awesome.
import 'font-awesome/css/font-awesome.css';

import FroalaEditor from 'react-froala-wysiwyg';
import FroalaEditorView from 'react-froala-wysiwyg/FroalaEditorView';

// [pwa]
import './beyond-grammar/styles/froala-plugin-styles.css';
import { beyondGrammar } from './beyond-grammar/beyond-grammar-plugin';

// Render Froala Editor component.
class EditorComponent extends React.Component {
  constructor() {
    super();

    this.state = {
      content: '<span>My Document\'s Title</span>'
    };

    this.handleModelChange = this.handleModelChange.bind(this);
  }

  handleModelChange (model) {
    this.setState({
      content: model
    });
  }

  // [pwa] start block
  buttons = ['paragraphFormat', 'bold', 'italic', 'underline', 'strikeThrough', 'align', 'formatOL', 'formatUL', 'insertTable', 'insertImage', 'insertLink', 'undo', 'redo', 'quote', 'fullscreen', 'html', '|', 'BeyondGrammar'];

  config = {
    toolbarButtons: this.buttons,
    toolbarButtonsMD: this.buttons,
    toolbarButtonsSM: this.buttons,
    toolbarButtonsXS: this.buttons,
    bgOptions: {
      service: {
        apiKey: 'Your key'
      },
      grammar: {
        languageFilter: ['en-US', 'en-GB'],
        showContextThesaurus: true
      }
    }
  };
  // [pwa] end block

  render () {
    return(
      <div className="sample">
        <h2>Full Featured</h2>
        <FroalaEditor
          model={this.state.content}
          onModelChange={this.handleModelChange}
          config={this.config}    // [pwa] inject configuration
        />
        <h4>Rendered Content:</h4>
        <FroalaEditorView
          model={this.state.content}
        />
      </div>
    );
  }

}

// [pwa] start the plugin
beyondGrammar(jQuery);
ReactDOM.render(<EditorComponent/>, document.getElementById('editor'));

import 'file?name=[name].[ext]!./full_editor.html';