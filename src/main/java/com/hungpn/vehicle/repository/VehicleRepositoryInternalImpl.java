package com.hungpn.vehicle.repository;

import com.hungpn.vehicle.domain.Vehicle;
import com.hungpn.vehicle.repository.rowmapper.VehicleRowMapper;
import com.hungpn.vehicle.service.dto.PageResponse;
import io.r2dbc.spi.Row;
import io.r2dbc.spi.RowMetadata;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.r2dbc.convert.R2dbcConverter;
import org.springframework.data.r2dbc.core.R2dbcEntityOperations;
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate;
import org.springframework.data.r2dbc.repository.support.SimpleR2dbcRepository;
import org.springframework.data.relational.core.sql.Comparison;
import org.springframework.data.relational.core.sql.Condition;
import org.springframework.data.relational.core.sql.Conditions;
import org.springframework.data.relational.core.sql.Expression;
import org.springframework.data.relational.core.sql.Select;
import org.springframework.data.relational.core.sql.SelectBuilder.SelectFromAndJoin;
import org.springframework.data.relational.core.sql.Table;
import org.springframework.data.relational.repository.support.MappingRelationalEntityInformation;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.r2dbc.core.RowsFetchSpec;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Spring Data R2DBC custom repository implementation for the Vehicle entity.
 */
@SuppressWarnings("unused")
public class VehicleRepositoryInternalImpl extends SimpleR2dbcRepository<Vehicle, Long> implements VehicleRepositoryInternal {

    private final DatabaseClient db;
    private final R2dbcEntityTemplate r2dbcEntityTemplate;
    private final EntityManager entityManager;

    private final VehicleRowMapper vehicleMapper;

    private static final Table entityTable = Table.aliased("vehicle", EntityManager.ENTITY_ALIAS);

    public VehicleRepositoryInternalImpl(
        R2dbcEntityTemplate template,
        EntityManager entityManager,
        VehicleRowMapper vehicleMapper,
        R2dbcEntityOperations entityOperations,
        R2dbcConverter converter
    ) {
        super(
            new MappingRelationalEntityInformation(converter.getMappingContext().getRequiredPersistentEntity(Vehicle.class)),
            entityOperations,
            converter
        );
        this.db = template.getDatabaseClient();
        this.r2dbcEntityTemplate = template;
        this.entityManager = entityManager;
        this.vehicleMapper = vehicleMapper;
    }

    @Override
    public Flux<Vehicle> findAllBy(Pageable pageable) {
        return createQuery(pageable, null).all();
    }

    RowsFetchSpec<Vehicle> createQuery(Pageable pageable, Condition whereClause) {
        List<Expression> columns = VehicleSqlHelper.getColumns(entityTable, EntityManager.ENTITY_ALIAS);
        SelectFromAndJoin selectFrom = Select.builder().select(columns).from(entityTable);
        // we do not support Criteria here for now as of https://github.com/jhipster/generator-jhipster/issues/18269
        String select = entityManager.createSelect(selectFrom, Vehicle.class, pageable, whereClause);
        return db.sql(select).map(this::process);
    }

    @Override
    public Flux<Vehicle> findAll() {
        return findAllBy(null);
    }

    @Override
    public Mono<Vehicle> findById(Long id) {
        Comparison whereClause = Conditions.isEqual(entityTable.column("id"), Conditions.just(id.toString()));
        return createQuery(null, whereClause).one();
    }

    private Vehicle process(Row row, RowMetadata metadata) {
        Vehicle entity = vehicleMapper.apply(row, "e");
        return entity;
    }

    @Override
    public <S extends Vehicle> Mono<S> save(S entity) {
        return super.save(entity);
    }


    @Override
    public Mono<PageResponse<Vehicle>> search(String name, Long type, int page, int size) {
        long offset = (long) page * size;

        String baseWhere = """
            FROM vehicle v
            WHERE (:name IS NULL OR v.name LIKE CONCAT('%', :name, '%') )
              AND (:type IS NULL OR v.type = :type)
        """;

        DatabaseClient.GenericExecuteSpec spec = db.sql("""
                SELECT v.* """ + baseWhere + """
                ORDER BY v.id
                LIMIT :limit OFFSET :offset
            """);

//            .bind("name", name)
//            .bind("type", type)
//            .bind("limit", size)
//            .bind("offset", offset)
//            .map((row, meta) -> mapVehicle(row))   // TODO: viết hàm mapVehicle()
//            .all()
//            .collectList();
        if (name != null) {
            spec = spec.bind("name", name);
        } else {
            spec = spec.bindNull("name", String.class);
        }

        if (type != null) {
            spec = spec.bind("type", type);
        } else {
            spec = spec.bindNull("type", Long.class);
        }
        spec = spec.bind("limit", size)
            .bind("offset", offset);

        Mono<List<Vehicle>> items = spec
            .map((row, meta) -> mapVehicle(row))
            .all()
            .collectList();

         DatabaseClient.GenericExecuteSpec countSpec = db.sql("SELECT COUNT(*) " + baseWhere);
//            .bind("name", name)
//            .bind("type", type)
//            .map((row, meta) -> row.get(0, Long.class))
//            .one();

        if (name != null) {
            countSpec = countSpec.bind("name", name);
        } else countSpec = countSpec.bindNull("name", String.class);

        if (type != null) {
            countSpec = countSpec.bind("type", type);
        } else countSpec = countSpec.bindNull("type", Long.class);

        Mono<Long> total = countSpec
            .map((row, meta) -> row.get(0, Long.class))
            .one();
        return Mono.zip(items, total).map(t -> {
            List<Vehicle> content = t.getT1();
            long totalElements = t.getT2();
            int totalPages = (int) Math.ceil((double) totalElements / size);
            return new PageResponse<>(content, totalElements, totalPages, page, size);
        });
    }

    private Vehicle mapVehicle(Row row) {
        Vehicle v = new Vehicle();
        v.setId(row.get("id", Long.class));
        v.setName(row.get("name", String.class));
        v.setType(row.get("type", Long.class)); // hoặc Long tùy schema
        v.setPurchaseDate(row.get("purchase_date", LocalDate.class));
        v.setRegistrationDate(row.get("registration_date", LocalDate.class));
        return v;
    }

}
