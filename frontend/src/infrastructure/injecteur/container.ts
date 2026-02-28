import { LoginUseCase } from "@/src/application/usecases/user/loginUser-usecase";
import { ApiAuthRepositoryImp } from "../repositories/Auth-RepositoryImp";
import { RegisterUseCase } from "@/src/application/usecases/user/registerUser-usecase";
import { LogOutUseCase } from "@/src/application/usecases/user/LogOut-usecase";

const authRepository = new ApiAuthRepositoryImp();

export const container = {
  loginUser: new LoginUseCase(authRepository),
  registerUser: new RegisterUseCase(authRepository),
  logoutUser: new LogOutUseCase(authRepository),
};