import * as React from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import styled from 'styled-components';
require('../components/Application.scss');

import Markdown from '../components/Markdown';
import SearchBar from '../components/SearchBar';
import QueryResults from '../components/QueryResults';
import Page from './page';
import { ApplicationState } from '../stores';
import { 
    setQuery, 
    activeIdxIncrease,
    activeIdxDecrease,
    setActiveIdx,
    openDocument,
    deleteDocument,
    prependDocument,
    updateDocument,
    forceRender,
} from '../stores/search/actions';
import { Document } from '../stores/search/types';

interface PropsFromState {
    query: string;
    activeIdx: number;
    documents: Document[];
    renderIdx: number;
}

interface PropsFromDispatch {
    setQuery: typeof setQuery;
    activeIdxIncrease: typeof activeIdxIncrease;
    activeIdxDecrease: typeof activeIdxDecrease;
    setActiveIdx: typeof setActiveIdx;
    openDocument: typeof openDocument;
    deleteDocument: typeof deleteDocument;
    prependDocument: typeof prependDocument;
    updateDocument: typeof updateDocument;
    forceRender: typeof forceRender;
}

type AllProps = PropsFromState & PropsFromDispatch;

class SearchPage extends React.Component<AllProps> {

    public handleKeyDown(e) {
        const { 
            documents,
            activeIdx,
            activeIdxIncrease,
            activeIdxDecrease,
            openDocument,
            deleteDocument,
        } = this.props;

        if (e.keyCode === 38 && activeIdx > 0) {
            activeIdxDecrease()
        } else if (e.keyCode === 40 && activeIdx < documents.length - 1) {
            activeIdxIncrease()
        } else if (e.key === "Enter") {
            openDocument()
        } else if (e.metaKey && e.key === 'd') {
            deleteDocument(documents[activeIdx])
        }

    }

    componentDidMount() {
        ipcRenderer.on('new-document', (e, doc) => {
            if (!doc.isUpdate) {
                this.props.prependDocument(doc)
            } else {
                this.props.updateDocument(doc);
            }
        });

        ipcRenderer.on('rnd::focus-search', (e) => {
            this.props.forceRender()
        });
    }

    componentWillMount() {
        document.addEventListener("keydown", this.handleKeyDown.bind(this));
        this.props.setQuery("")
    }

  	componentWillUnmount() {
    	document.removeEventListener("keydown", this.handleKeyDown.bind(this));
  	}   

    public render() {
        const { 
            query, 
            documents,
            setQuery, 
            activeIdx,
            activeIdxIncrease,
            activeIdxDecrease,
            setActiveIdx,
            renderIdx,
        } = this.props;

        const activeDoc: Document = documents[activeIdx]
        const markdown: string = activeDoc ? activeDoc.text : "";

        return (
            <Page>
                <SearchContainer key={renderIdx}>
                    <SearchBar query={query} setQuery={setQuery} />
                </SearchContainer>
                <SearchResultsContainer>
                    <QueryResults 
                      documents={documents}
                      activeIdx={activeIdx}
                      increaseActiveIdx={activeIdxIncrease}
                      decreaseActiveIdx={activeIdxDecrease}
                      setActiveIdx={setActiveIdx}
                    />
                    <Markdown 
                        markdown={markdown} 
                        activeIdx={markdown}
                        onSave={() => console.log("no op")}
                        setMarkdown={() => console.log("no op")}
                        readOnly={true}
                    />
                </SearchResultsContainer>
            </Page>
        );
    }
}

const mapStateToProps = ({ search }: ApplicationState) => ({
    query: search.query,
    documents: search.documents,
    activeIdx: search.activeIdx,
    renderIdx: search.renderIdx,
});

const mapDispatchToProps = {
    setQuery,
    activeIdxIncrease,
    activeIdxDecrease,
    setActiveIdx,
    openDocument,
    deleteDocument,
    prependDocument,
    updateDocument,
    forceRender,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SearchPage);

const SearchResultsContainer = styled('div')`
    display: flex;
    flex-direction: row;
    height: 100%;
    background-color: #fff;
	padding: 0px;
	-webkit-app-region: no-drag;
`

const SearchContainer = styled('div')`
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    width: 100%;
    height: 90px;
    position: relative;
    border-bottom: 1px solid #dedede;
`
