import { ApiAuthRepositoryImp } from "../repositories/Auth-RepositoryImp";
import { ApiActivityRepositoryImp } from "../repositories/Activity-RepositoryImp";
import { ApiVoteRepositoryImp } from "../repositories/Vote-RepositoryImp";
import { ApiBillRepositoryImp } from "../repositories/Bill-RepositoryImp";

import { LoginUseCase } from "@/src/application/usecases/user/loginUser-usecase";
import { RegisterUseCase } from "@/src/application/usecases/user/registerUser-usecase";
import { LogOutUseCase } from "@/src/application/usecases/user/logOut-usecase";

import { GetActivitiesUseCase } from "@/src/application/usecases/activiy/getActivities-usecase";
import { GetActivityUseCase } from "@/src/application/usecases/activiy/getActivity-usecase";
import { RespondInviteUserUseCase } from "@/src/application/usecases/activiy/respondInvite-usecase";
import { StartActivityUseCase } from "@/src/application/usecases/activiy/startActitivy-usecase";
import { StopActivityUseCase } from "@/src/application/usecases/activiy/StopActivity-usecase";

import { SubmitVotesUseCase } from "@/src/application/usecases/vote/submitVote-usecase";
import { GetVoteResultsUseCase } from "@/src/application/usecases/vote/getResult-usecase";
import { GetVoteStatusUseCase } from "@/src/application/usecases/vote/getVoteStatus-usecase";



import { CreateBillUseCase } from "@/src/application/usecases/bill/createBill-usecase";
import { GetBillUseCase } from "@/src/application/usecases/bill/getBill-usecase";
import { CreateActivityUseCase } from "@/src/application/usecases/activiy/createActivity-usecase";
import { InviteUserUseCase } from "@/src/application/usecases/activiy/inviteUser-usecase";

const authRepository = new ApiAuthRepositoryImp();
const activityRepository = new ApiActivityRepositoryImp();
const voteRepository = new ApiVoteRepositoryImp();
const billRepository = new ApiBillRepositoryImp();

export const container = {
    loginUser: new LoginUseCase(authRepository),
    registerUser: new RegisterUseCase(authRepository),
    logoutUser: new LogOutUseCase(authRepository),

    createActivity: new CreateActivityUseCase(activityRepository),
    getActivities: new GetActivitiesUseCase(activityRepository),
    getActivity: new GetActivityUseCase(activityRepository),
    inviteUser: new InviteUserUseCase(activityRepository),
    respondInvite: new RespondInviteUserUseCase(activityRepository),
    startActivity: new StartActivityUseCase(activityRepository),
    stopActivity: new StopActivityUseCase(activityRepository),

    submitVotes: new SubmitVotesUseCase(voteRepository),
    getVoteResults: new GetVoteResultsUseCase(voteRepository),
    getVoteStatus: new GetVoteStatusUseCase(voteRepository),

    createBill: new CreateBillUseCase(billRepository),
    getBill: new GetBillUseCase(billRepository),
};