import { Controller, Post, Body } from '@nestjs/common';
import { MoveDto } from './dto/move.dto';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('move')
  move(@Body() moveDto: MoveDto) {
    return this.gameService.handleMove(
      moveDto.gameId,
      moveDto.x,
      moveDto.y,
    );
  }
  
}