import { apiRequest } from "./http.js";

export function listChannelsRequest(
    {
        page = 1,
        pageSize = 10,
        search = "",
        source = "",
    },
    token,
    signal,
) {
    const query = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
    });

    if (search) {
        query.set("buscar", search);
    }

    if (source) {
        query.set("fuente", source);
    }

    return apiRequest(`/canales?${query.toString()}`, {
        token,
        signal,
    });
}

export function getChannelRequest(
    channelId,
    token,
    signal,
) {
    return apiRequest(`/canales/${channelId}`, {
        token,
        signal,
    });
}

export function createChannelRequest(channel, token) {
    return apiRequest("/canales", {
        method: "POST",
        body: channel,
        token,
    });
}

export function updateChannelRequest(
    channelId,
    channel,
    token,
) {
    return apiRequest(`/canales/${channelId}`, {
        method: "PUT",
        body: channel,
        token,
    });
}

export function deleteChannelRequest(channelId, token) {
    return apiRequest(`/canales/${channelId}`, {
        method: "DELETE",
        token,
    });
}