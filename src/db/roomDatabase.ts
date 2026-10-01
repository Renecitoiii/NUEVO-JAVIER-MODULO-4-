import { Trip, Expense, MetaPresupuesto } from '../types';

/**
 * Room Database & DAO Simulation in TypeScript
 * Matches Room entities and DAO specifications:
 *
 * @Entity(tableName = "trayecto")
 * @Entity(tableName = "gasto")
 * @Entity(tableName = "meta_presupuesto")
 */

export interface TrayectoEntity extends Trip {}
export interface GastoEntity extends Expense {}
export interface MetaPresupuestoEntity extends MetaPresupuesto {}

export class TrayectoDao {
  private trips: TrayectoEntity[];

  constructor(trips: TrayectoEntity[]) {
    this.trips = trips;
  }

  // @Query("SELECT * FROM trayecto ORDER BY date DESC, time DESC")
  getAll(): TrayectoEntity[] {
    return [...this.trips].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  }

  // @Query("SELECT * FROM trayecto WHERE date = :date ORDER BY time ASC")
  getByDate(date: string): TrayectoEntity[] {
    return this.trips.filter((t) => t.date === date).sort((a, b) => a.time.localeCompare(b.time));
  }

  // @Query("SELECT AVG(durationMinutes) FROM trayecto")
  getAverageDurationMinutes(): number {
    if (this.trips.length === 0) return 0;
    const sum = this.trips.reduce((acc, t) => acc + t.durationMinutes, 0);
    return Math.round(sum / this.trips.length);
  }

  // @Query("SELECT SUM(distanceKm) FROM trayecto")
  getTotalDistanceKm(): number {
    return Number(this.trips.reduce((acc, t) => acc + t.distanceKm, 0).toFixed(1));
  }

  // @Query("SELECT SUM(co2Kg) FROM trayecto")
  getTotalCO2Kg(): number {
    return Number(this.trips.reduce((acc, t) => acc + t.co2Kg, 0).toFixed(2));
  }

  // @Query("SELECT SUM(co2SavedKg) FROM trayecto")
  getTotalCO2SavedKg(): number {
    return Number(this.trips.reduce((acc, t) => acc + t.co2SavedKg, 0).toFixed(2));
  }
}

export class GastoDao {
  private expenses: GastoEntity[];

  constructor(expenses: GastoEntity[]) {
    this.expenses = expenses;
  }

  // @Query("SELECT * FROM gasto ORDER BY date DESC, time DESC")
  getAll(): GastoEntity[] {
    return [...this.expenses].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  }

  // @Query("SELECT SUM(amount) FROM gasto WHERE strftime('%Y-%m', date) = :month")
  getMonthExpensesSum(monthStr: string): number {
    return this.expenses
      .filter((e) => e.date.startsWith(monthStr))
      .reduce((sum, e) => sum + e.amount, 0);
  }

  // @Query("SELECT SUM(amount) FROM gasto WHERE date = :date")
  getDailyExpensesSum(dateStr: string): number {
    return this.expenses
      .filter((e) => e.date === dateStr)
      .reduce((sum, e) => sum + e.amount, 0);
  }

  // @Query("SELECT category, SUM(amount) as total FROM gasto WHERE strftime('%Y-%m', date) = :month GROUP BY category")
  getExpensesByCategory(monthStr: string): Record<string, number> {
    const result: Record<string, number> = {};
    this.expenses
      .filter((e) => e.date.startsWith(monthStr))
      .forEach((e) => {
        result[e.category] = (result[e.category] || 0) + e.amount;
      });
    return result;
  }
}

export class MetaPresupuestoDao {
  private budget: MetaPresupuestoEntity;

  constructor(budget: MetaPresupuestoEntity) {
    this.budget = budget;
  }

  // @Query("SELECT * FROM meta_presupuesto WHERE month = :month LIMIT 1")
  getBudget(): MetaPresupuestoEntity {
    return this.budget;
  }
}

/**
 * Kotlin Jetpack Compose & Room Architecture Reference
 * Ready to view or copy into an Android Studio project.
 */
export const JETPACK_COMPOSE_SNIPPETS = {
  navigationBar: `// Jetpack Compose BottomNavigationBar
@Composable
fun HuellaDiariaBottomNavigation(
    currentRoute: String,
    onNavigate: (String) -> Unit,
    tripsCountToday: Int,
    expensesAmountToday: Double
) {
    val items = listOf(
        NavigationItem("inicio", "Inicio", Icons.Default.DirectionsTransit, tripsCountToday),
        NavigationItem("gastos", "Gastos", Icons.Default.Wallet, null),
        NavigationItem("impacto", "Mi Impacto", Icons.Default.Eco, null)
    )

    NavigationBar(
        containerColor = Color(0xFF2C3E50), // Navy Dark
        contentColor = Color.White
    ) {
        items.forEach { item ->
            val isSelected = currentRoute == item.route
            NavigationBarItem(
                selected = isSelected,
                onClick = { onNavigate(item.route) },
                icon = {
                    BadgedBox(
                        badge = {
                            if (item.badgeCount != null && item.badgeCount > 0) {
                                Badge(containerColor = Color(0xFF2ECC71)) {
                                    Text("\${item.badgeCount}")
                                }
                            }
                        }
                    ) {
                        Icon(item.icon, contentDescription = item.label)
                    }
                },
                label = { Text(item.label) },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = Color(0xFF2ECC71),
                    indicatorColor = Color(0x332ECC71)
                )
            )
        }
    }
}`,

  roomEntities: `// Room Entities & DAO (AppDatabase.kt)
@Entity(tableName = "trayecto")
data class Trayecto(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val date: String,
    val time: String,
    val origin: String,
    val destination: String,
    val mode: String,
    val distanceKm: Double,
    val durationMinutes: Int,
    val purpose: String,
    val cost: Double?,
    val co2Kg: Double,
    val co2SavedKg: Double,
    val waterIntakeMl: Int? = 0
)

@Entity(tableName = "gasto")
data class Gasto(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val date: String,
    val time: String,
    val category: String,
    val amount: Double,
    val paymentMethod: String,
    val note: String?,
    val fuelLiters: Double? = null
)

@Entity(tableName = "meta_presupuesto")
data class MetaPresupuesto(
    @PrimaryKey val id: String,
    val month: String,
    val dailyLimit: Double,
    val monthlyLimit: Double,
    val warningThresholdPercent: Int = 80,
    val alertThresholdPercent: Int = 100
)

@Dao
interface TrayectoDao {
    @Query("SELECT * FROM trayecto WHERE date = :date ORDER BY time ASC")
    fun getByDate(date: String): Flow<List<Trayecto>>

    @Query("SELECT AVG(durationMinutes) FROM trayecto")
    suspend fun getAverageDurationMinutes(): Double?

    @Query("SELECT SUM(distanceKm) FROM trayecto")
    suspend fun getTotalDistanceKm(): Double?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTrayecto(trayecto: Trayecto)
}

@Dao
interface GastoDao {
    @Query("SELECT SUM(amount) FROM gasto WHERE strftime('%Y-%m', date) = :month")
    suspend fun getMonthExpensesSum(month: String): Double?

    @Query("SELECT SUM(amount) FROM gasto WHERE date = :date")
    suspend fun getDailyExpensesSum(date: String): Double?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertGasto(gasto: Gasto)
}`,

  themeConfig: `// Jetpack Compose Theme (Theme.kt)
val EmeraldGreen = Color(0xFF2ECC71)
val EmeraldDark = Color(0xFF27AE60)
val MidnightNavy = Color(0xFF2C3E50)
val DarkNavyBackground = Color(0xFF1A252F)

val DarkColorScheme = darkColorScheme(
    primary = EmeraldGreen,
    onPrimary = Color.Black,
    surface = MidnightNavy,
    background = DarkNavyBackground,
    secondary = Color(0xFF3498DB)
)

val LightColorScheme = lightColorScheme(
    primary = EmeraldGreen,
    surface = Color(0xFFF8FAFC),
    background = Color.White
)`,
};
