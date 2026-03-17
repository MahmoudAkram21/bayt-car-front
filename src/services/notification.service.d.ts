export declare const notificationService: {
    /**
     * Admin only: send a push notification to an app user. Title and body in English and Arabic; at least one of titleEn or titleAr required.
     */
    sendToUser(params: {
        userId: string;
        titleEn?: string;
        titleAr?: string;
        bodyEn?: string;
        bodyAr?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
};
