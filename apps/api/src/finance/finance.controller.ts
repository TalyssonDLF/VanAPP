import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard, AuthenticatedRequest } from "../auth/auth.guard";
import {
  BillingDto,
  CancelDto,
  CreateTransactionDto,
  FuelDto,
  ListTransactionsDto,
  PaymentDto,
  UpdateTransactionDto,
} from "./dto/finance.dto";
import { FinanceService } from "./finance.service";

@UseGuards(AuthGuard)
@Controller("finance")
export class FinanceController {
  constructor(private readonly finance: FinanceService) {}
  @Get("dashboard") dashboard(@Req() req: AuthenticatedRequest) {
    return this.finance.dashboard(req.user.sub);
  }
  @Get("transactions") list(
    @Req() req: AuthenticatedRequest,
    @Query() dto: ListTransactionsDto,
  ) {
    return this.finance.list(req.user.sub, dto);
  }
  @Post("transactions") create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.finance.create(req.user.sub, dto);
  }
  @Patch("transactions/:id") update(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.finance.update(req.user.sub, id, dto);
  }
  @Post("transactions/:id/payments") pay(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() dto: PaymentDto,
    @Headers("idempotency-key") key?: string,
  ) {
    return this.finance.pay(req.user.sub, id, dto, key);
  }
  @Post("transactions/:id/cancel") cancel(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() dto: CancelDto,
  ) {
    return this.finance.cancel(req.user.sub, id, dto.reason);
  }
  @Post("billings") billing(
    @Req() req: AuthenticatedRequest,
    @Body() dto: BillingDto,
  ) {
    return this.finance.createBilling(req.user.sub, dto);
  }
  @Post("fuel") fuel(@Req() req: AuthenticatedRequest, @Body() dto: FuelDto) {
    return this.finance.createFuel(req.user.sub, dto);
  }
}
