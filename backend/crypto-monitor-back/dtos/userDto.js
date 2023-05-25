module.exports = class UserDto {
    name
    isActivated

    constructor(model) {
        this.name = model.name
        this.isActivated = model.isActivated
    }
}