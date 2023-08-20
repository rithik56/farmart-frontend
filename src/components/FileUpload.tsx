import React, { useState, useEffect } from 'react'
import { Table, message, Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons'
import axios from 'axios';
import type { UploadFile, RcFile } from 'antd/es/upload/interface';

interface IFile {
    url: String,
    name: String,
    mimetype: String,
    encoding: String,
    size: Number
}

const fileColumns = [
    {
        title: 'Url',
        dataIndex: 'url',
    },
    {
        title: 'Name',
        dataIndex: 'name'
    },
    {
        title: 'Type',
        dataIndex: 'mimetype'
    },
    {
        title: 'Size (Kb)',
        dataIndex: 'size'
    }
]

const { Dragger } = Upload

const FileUpload = () => {

    const [isUploading, setIsUploading] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [fileName, setFileName] = useState<string>("");
    const [shortUrl, setShortUrl] = useState<string>("")
    const [files, setFiles] = useState<IFile[]>([])

    const handleUpload = async () => {

        if (fileList.length === 0) {
            message.error({
                content: <span>No File Selected</span>
            })
            return;
        }

        setIsUploading(true)

        const formData = new FormData()
        formData.append("file", fileList[0] as RcFile)
        formData.append("fileName", fileName)

        try {
            const response = await axios.post(`https://farmart-backend.onrender.com/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data', Accept: 'application/json' }, transformRequest: formData => formData })
            const { data } = response
            message.success({
                content: 'file uploaded successfully'
            })
            setShortUrl(data.shortUrl)
            getFiles()
        } catch (err: any) {
            console.log(err)
            let content
            if (err.response) {
                content = err.response.data
            }
            else if (err.request) {
                content = 'no response'
            }
            else {
                content = err.message
            }
            message.error({
                content: <span>{content}</span>
            })
        }

        finally {
            setIsUploading(false)
            setFileList([])
        }
    };

    const getFiles = async () => {
        setIsLoading(true)
        try {
            const res = await axios.get(`https://farmart-backend.onrender.com/files`)
            const { data } = res
            setFiles(data.files)
        } catch (err: any) {
            let content
            if (err.response) {
                content = err.response.data
            }
            else if (err.request) {
                content = err.request
            }
            else {
                content = err.message
            }
            message.error({
                content: <span>{content}</span>
            })
        }
        setIsLoading(false)
    }

    useEffect(() => {
        getFiles()
    }, [])

    return (
        <div className="App">
            <Upload
                beforeUpload={(file) => {
                    setFileList([...fileList, file]);
                    return false
                }}
                onRemove={(file: UploadFile<any>) => {
                    const index = fileList.indexOf(file);
                    const newFileList = fileList.slice();
                    newFileList.splice(index, 1);
                    setFileList(newFileList);
                }}
                fileList={fileList}
            >
                <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
            <Button
                type="primary"
                onClick={handleUpload}
                disabled={fileList.length === 0}
                loading={isUploading}
                style={{
                    marginTop: 16,
                }}
            >
                {isUploading ? 'Uploading' : 'Start Upload'}
            </Button>
            <h1>Files</h1>
            <Table
                loading={isLoading}
                columns={fileColumns}
                dataSource={files}
            />
        </div>
    );

}

export default FileUpload;