import * as React from 'react'
import Dropzone, { type DropEvent, type FileRejection } from 'react-dropzone'
import { Button, Form } from 'semantic-ui-react'
import styled from 'styled-components'
import { getUploadUrl, uploadFile } from '../api/todos-api'
import Auth from '../auth/Auth'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile
}

interface EditTodoProps {
  match: {
    params: {
      todoId: string
    }
  }
  auth: Auth
}

interface EditTodoState {
  file: any
  uploadState: UploadState
}

export class EditTodo extends React.PureComponent<
  EditTodoProps,
  EditTodoState
> {
  state: EditTodoState = {
    file: undefined,
    uploadState: UploadState.NoUpload
  }

  componentWillUnmount() {
    if (this.state.file) {
      // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
      URL.revokeObjectURL(this.state.file.preview)
    }
  }

  handleFileChange = (
    acceptedFiles: File[],
    fileRejections: FileRejection[],
    event: DropEvent
  ) => {
    if (fileRejections.length > 1) alert('Only select 1 image')
    if (acceptedFiles.length === 0) return

    const generatePreviewImage = Object.assign(acceptedFiles[0], {
      preview: URL.createObjectURL(acceptedFiles[0])
    })

    this.setState({
      file: generatePreviewImage
    })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!this.state.file) {
        alert('File should be selected')
        return
      }

      this.setUploadState(UploadState.FetchingPresignedUrl)
      const uploadUrl = await getUploadUrl(
        this.props.auth.getIdToken(),
        this.props.match.params.todoId
      )
      this.setUploadState(UploadState.UploadingFile)
      await uploadFile(uploadUrl, this.state.file)

      alert('File was uploaded!')
    } catch (e) {
      alert('Could not upload a file: ' + (e as Error).message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  render() {
    return (
      <div>
        <h1>Upload new image</h1>

        <Form onSubmit={this.handleSubmit}>
          <Dropzone onDrop={this.handleFileChange} accept={{ 'image/*': [] }} maxFiles={1}>
            {({ getRootProps, getInputProps }) => (
              <section className="container">
                <Container {...getRootProps({ className: 'dropzone' })}>
                  <input {...getInputProps()} />
                  <p>Drag 'n' drop image here, or click to select file</p>
                </Container>
                <aside>
                  <h4>Files</h4>
                  {this.state.file && (
                    <div>
                      {this.renderPreviewImage()}
                      <br/>
                      {this.state.file.name} - {this.state.file.size} bytes
                      <br />
                      {this.renderButton()}
                    </div>
                  )}
                </aside>
              </section>
            )}
          </Dropzone>
        </Form>
      </div>
    )
  }

  renderButton() {
    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && (
          <p>Uploading image metadata</p>
        )}
        {this.state.uploadState === UploadState.UploadingFile && (
          <p>Uploading file</p>
        )}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Upload
        </Button>
      </div>
    )
  }

  renderPreviewImage() {
    return (
      <div style={thumb} key={this.state.file.name}>
        <div style={thumbInner}>
          <img
            src={this.state.file.preview}
            style={img}
            alt="preview"
            // Revoke data uri after image is loaded
            onLoad={() => {
              URL.revokeObjectURL(this.state.file.preview)
            }}
          />
        </div>
      </div>
    )
  }
}

const getColor = (props: any) => {
  if (props.isDragAccept) {
    return '#00e676'
  }
  if (props.isDragReject) {
    return '#ff1744'
  }
  if (props.isFocused) {
    return '#2196f3'
  }
  return '#eeeeee'
}

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-width: 2px;
  border-radius: 2px;
  border-color: ${(props) => getColor(props)};
  border-style: dashed;
  background-color: #fafafa;
  color: #bdbdbd;
  outline: none;
  transition: border 0.24s ease-in-out;
`

// const thumbsContainer = {
//   display: 'flex',
//   flexDirection: 'row',
//   flexWrap: 'wrap',
//   marginTop: 16
// }

const thumb: any = {
  display: 'inline-flex',
  borderRadius: 2,
  border: '1px solid #eaeaea',
  marginBottom: 8,
  marginRight: 8,
  width: 100,
  height: 100,
  padding: 4,
  boxSizing: 'border-box'
}

const thumbInner = {
  display: 'flex',
  minWidth: 0,
  overflow: 'hidden'
}

const img = {
  display: 'block',
  width: 'auto',
  height: '100%'
}
