export const config = {
    port: process.env.PORT || 3030,
    jwtSecret: process.env.JWT_SECRET || 'abhilashisadeveloper',
    databaseUrl: process.env.DATABASE_URL || "postgresql://postgres:Abhidev@123@localhost:5432/web3"
};
