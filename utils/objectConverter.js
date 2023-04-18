exports.userResponse = (users) => {



    const userResult = [];

    users.forEach(user => {
        userResult.push({
            name: user.name,
            userId: user.userId,
            email: user.email,
            userTypes: user.userTypes,
            userStatus: user.userStatus
        })
    });

    return userResult;
}