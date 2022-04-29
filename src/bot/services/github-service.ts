import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import {
    IGetCommitsRequest,
    ICreateIssueRequest,
    IIssue,
    ICommitData,
    ISearchResult,
} from '../types/github';

function getDefaultAxiosConfig(): AxiosRequestConfig {
    return {
        auth: {
            username: process.env.GITHUB_USER,
            password: process.env.GITHUB_TOKEN,
        },
        headers: {
            'User-Agent': 'crowbartools/crowbartools-discord-bot',
        },
    };
}

export async function createIssue(
    createIssueRequest: ICreateIssueRequest
): Promise<IIssue> {
    const createUrl = `https://api.github.com/repos/${createIssueRequest.repo}/issues`;
    const body = {
        title: createIssueRequest.title,
        body: createIssueRequest.body,
        labels: createIssueRequest.labels,
    };

    let response: AxiosResponse<IIssue>;
    try {
        response = await axios.post(createUrl, body, getDefaultAxiosConfig());
    } catch (error) {
        console.log(error);
    }

    if (response && response.status === 201) {
        return response.data;
    }

    return null;
}

export async function searchIssues(
    repo: string,
    search: string
): Promise<IIssue[]> {
    if (repo == null) {
        return null;
    }

    let query = `repo:${repo} is:open ${search}`;

    // github doesnt support queries longer than 256
    if (query.length > 256) {
        query = query.substring(0, 255);
    }

    const searchUrl = `https://api.github.com/search/issues?q=${encodeURIComponent(
        query
    )}`;

    let response: AxiosResponse<ISearchResult>;
    try {
        response = await axios.get<ISearchResult>(
            searchUrl,
            getDefaultAxiosConfig()
        );
    } catch (error) {
        console.log('Error searching github issues', error);
    }

    if (response && response.status === 200) {
        return response.data.items;
    }

    return null;
}

export async function getIssue(
    repo: string,
    issueNumber: number
): Promise<IIssue> {
    if (repo == null || issueNumber == null) {
        return null;
    }

    const getIssueUrl = `https://api.github.com/repos/${repo}/issues/${issueNumber}`;

    let response: AxiosResponse<IIssue>;
    try {
        response = await axios.get<IIssue>(
            getIssueUrl,
            getDefaultAxiosConfig()
        );
    } catch (error) {
        console.log('Error getting github issue', error);
    }

    if (response && response.status === 200) {
        return response.data;
    }

    return null;
}

export async function getRecentCommits(
    getCommitsRequest: IGetCommitsRequest
): Promise<ICommitData[]> {
    let commitsUrl = `https://api.github.com/repos/${getCommitsRequest.branch}/commits`;
    commitsUrl += `?sha=${getCommitsRequest.branch}`;
    commitsUrl += `&since=${getCommitsRequest.sinceDateString}`;

    let response: AxiosResponse<ICommitData[]>;
    try {
        response = await axios.get<ICommitData[]>(
            commitsUrl,
            getDefaultAxiosConfig()
        );
    } catch (error) {
        console.log('Error getting recent commit messages', error);
    }

    if (response && response.status == 200) {
        return response.data;
    }

    return null;
}
