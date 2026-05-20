/**
 * @fileoverview Comment operations for the MCP Kanban server
 *
 * This module provides functions for interacting with comments in the Planka Kanban board,
 * including creating, retrieving, updating, and deleting comments on cards.
 */

import { z } from "zod";
import { plankaRequest } from "../common/utils.js";

// Schema definitions
/**
 * Schema for creating a new comment
 * @property {string} cardId - The ID of the card to create the comment on
 * @property {string} text - The text content of the comment
 */
export const CreateCommentSchema = z.object({
    cardId: z.string().describe("Card ID"),
    text: z.string().describe("Comment text"),
});

/**
 * Schema for retrieving comments from a card
 * @property {string} cardId - The ID of the card to get comments from
 */
export const GetCommentsSchema = z.object({
    cardId: z.string().describe("Card ID"),
});

/**
 * Schema for retrieving a specific comment
 * @property {string} id - The ID of the comment to retrieve
 */
export const GetCommentSchema = z.object({
    id: z.string().describe("Comment ID"),
});

/**
 * Schema for updating a comment
 * @property {string} id - The ID of the comment to update
 * @property {string} text - The new text content for the comment
 */
export const UpdateCommentSchema = z.object({
    id: z.string().describe("Comment ID"),
    text: z.string().describe("Comment text"),
});

/**
 * Schema for deleting a comment
 * @property {string} id - The ID of the comment to delete
 */
export const DeleteCommentSchema = z.object({
    id: z.string().describe("Comment ID"),
});

// Type exports
/**
 * Type definition for comment creation options
 */
export type CreateCommentOptions = z.infer<typeof CreateCommentSchema>;

/**
 * Type definition for comment update options
 */
export type UpdateCommentOptions = z.infer<typeof UpdateCommentSchema>;

// Comment action schema
const CommentActionSchema = z.object({
    id: z.string(),
    type: z.literal("commentCard"),
    data: z.object({
        text: z.string(),
    }),
    cardId: z.string(),
    userId: z.string(),
    createdAt: z.string(),
    updatedAt: z.string().nullable(),
});

// Response schemas
const CommentActionsResponseSchema = z.object({
    items: z.array(CommentActionSchema),
    included: z.record(z.any()).optional(),
});

const CommentActionResponseSchema = z.object({
    item: CommentActionSchema,
    included: z.record(z.any()).optional(),
});

// Function implementations
/**
 * Creates a new comment on a card
 *
 * @param {CreateCommentOptions} options - Options for creating the comment
 * @param {string} options.cardId - The ID of the card to create the comment on
 * @param {string} options.text - The text content of the comment
 * @returns {Promise<object>} The created comment
 * @throws {Error} If the comment creation fails
 */
export async function createComment(options: CreateCommentOptions) {
    try {
        const response = await plankaRequest(
            `/api/cards/${options.cardId}/comments`,
            {
                method: "POST",
                body: {
                    text: options.text,
                },
            },
        );
        return response;
    } catch (error) {
        throw new Error(
            `Failed to create comment: ${
                error instanceof Error ? error.message : String(error)
            }`,
        );
    }
}

/**
 * Retrieves all comments for a specific card
 *
 * @param {string} cardId - The ID of the card to get comments for
 * @returns {Promise<Array<object>>} Array of comments on the card
 * @throws {Error} If retrieving comments fails
 */
export async function getComments(cardId: string) {
    try {
        const response = await plankaRequest(`/api/cards/${cardId}/comments`);

        if (response && typeof response === "object" && "items" in response) {
            const items = (response as { items: unknown[] }).items;
            if (Array.isArray(items)) {
                return items;
            }
        }

        if (Array.isArray(response)) {
            return response;
        }

        return [];
    } catch (error) {
        return [];
    }
}

/**
 * Retrieves a specific comment by ID
 *
 * @param {string} id - The ID of the comment to retrieve
 * @returns {Promise<object>} The requested comment
 * @throws {Error} If retrieving the comment fails
 */
export async function getComment(id: string) {
    try {
        const response = await plankaRequest(`/api/comments/${id}`);
        if (typeof response === "string" && response.includes("<!doctype html>")) {
            throw new Error("No direct GET endpoint for comments. Use get_all with cardId instead.");
        }
        return response;
    } catch (error) {
        throw new Error(
            `Failed to get comment: ${
                error instanceof Error ? error.message : String(error)
            }`,
        );
    }
}

/**
 * Updates a comment's text content
 *
 * @param {string} id - The ID of the comment to update
 * @param {Partial<Omit<CreateCommentOptions, "cardId">>} options - The properties to update
 * @param {string} options.text - The new text content for the comment
 * @returns {Promise<object>} The updated comment
 * @throws {Error} If updating the comment fails
 */
export async function updateComment(
    id: string,
    options: Partial<Omit<CreateCommentOptions, "cardId">>,
) {
    try {
        const response = await plankaRequest(`/api/comments/${id}`, {
            method: "PATCH",
            body: {
                text: options.text,
            },
        });
        return response;
    } catch (error) {
        throw new Error(
            `Failed to update comment: ${
                error instanceof Error ? error.message : String(error)
            }`,
        );
    }
}

/**
 * Deletes a comment by ID
 *
 * @param {string} id - The ID of the comment to delete
 * @returns {Promise<{success: boolean}>} Success indicator
 * @throws {Error} If deleting the comment fails
 */
export async function deleteComment(id: string) {
    try {
        await plankaRequest(`/api/comments/${id}`, {
            method: "DELETE",
        });
        return { success: true };
    } catch (error) {
        throw new Error(
            `Failed to delete comment: ${
                error instanceof Error ? error.message : String(error)
            }`,
        );
    }
}
